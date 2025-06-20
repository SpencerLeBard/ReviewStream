/* DO NOT EVER REMOVE THESE COMMENTS BELOW
npx ngrok http 5001 --domain=relieved-personally-serval.ngrok-free.app

curl -X POST http://localhost:5001/api/send-review \
     -H "Content-Type: application/json" \
     -d '{"customerPhone":"+12082302474"}'
*/

require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const twilio   = require('twilio');
const { rateLimit } = require('express-rate-limit');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');
const authLogger = require('./authLogger');

const app = express();

// Enable trust proxy to ensure express-rate-limit works correctly behind a proxy
app.set('trust proxy', 1);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/* Spencer's Company for POC */
const COMPANY_ID = 3;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('combined', { stream: logger.stream })); // Use winston stream

// Rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply the rate limiting middleware to API calls only
app.use('/api', apiLimiter);

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const companyRoutes = require('./routes/companyRoutes');
app.use('/api/companies', companyRoutes);

/* ──────────────────────────── COMPANY INFO  ──────────────────────────── */
/* Dashboard expects this exact path: /api/secure/users/company            */
app.get('/api/secure/users/company', async (_req, res) => {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', COMPANY_ID)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

/* ──────────────────────────── CONTACTS CRUD ──────────────────────────── */
app.get('/api/contacts', async (_req, res) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', COMPANY_ID)
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/contacts', async (req, res) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ ...req.body, company_id: COMPANY_ID }])
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.delete('/api/contacts/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('contacts').delete().eq('id', id);
  if (error) {
    logger.error('Error deleting contact', { error, contactId: id });
    return res.status(500).json({ error: error.message });
  }
  logger.info('Contact deleted successfully', { contactId: id });
  res.json({ ok: true });
});

/* ──────────────────────────── INBOUND SMS WEBHOOK ──────────────────────────── */
app.post('/api/text-webhook', async (req, res) => {
  const { From, Body = '', SmsSid } = req.body || {};
  logger.info(`Received SMS from ${From} with SID ${SmsSid}`, { from: From, body: Body, smsSid: SmsSid });

  const { data, error: reqError } = await supabase
    .from('review_requests')
    .select('id,company_id')
    .eq('customer_phone', From)
    .eq('responded', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (reqError) {
    logger.error('Error fetching review request', { error: reqError, from: From });
    return res.status(500).json({ error: 'database error' });
  }

  const reqRow = data && data.length > 0 ? data[0] : null;

  if (!reqRow) {
    logger.warn(`No open review request found for ${From}`, { from: From, smsSid: SmsSid });
    return res.status(400).json({ error: 'no open review request' });
  }

  const ratingMatch = Body.match(/\b([1-5])\s*stars?\b/i);
  const rating      = ratingMatch ? parseInt(ratingMatch[1], 10) : null;
  const bodyText    = Body.trim();
  if (!bodyText && rating === null) {
    logger.info(`Empty message from ${From}, sending thanks.`, { from: From, smsSid: SmsSid });
    return res
      .type('text/xml')
      .send('<Response><Message>Thanks!</Message></Response>');
  }

  const { error: reviewInsertError } = await supabase.from('reviews').insert([{
    company_id: reqRow.company_id,
    phone_from: From,
    body:       bodyText,
    rating
  }]);

  if (reviewInsertError) {
    logger.error('Error inserting review', { error: reviewInsertError, from: From, smsSid: SmsSid });
    // Decide if you want to stop execution here or just log the error
  }

  const { error: requestUpdateError } = await supabase
    .from('review_requests')
    .update({ responded: true, response_sid: SmsSid, rating, body: bodyText })
    .eq('id', reqRow.id);

  if (requestUpdateError) {
    logger.error('Error updating review_request', { error: requestUpdateError, reviewRequestId: reqRow.id, smsSid: SmsSid });
  }

  logger.info(`Successfully processed review from ${From}`, { from: From, rating, smsSid: SmsSid });

  res
    .type('text/xml')
    .send('<Response><Message>Thanks for your feedback!</Message></Response>');
});

app.post('/api/log-auth', (req, res) => {
  const { event, user, error } = req.body;
  if (error) {
    authLogger.error(`Authentication error: ${event}`, { error, user });
  } else {
    authLogger.info(`User ${event}`, { user });
  }
  res.sendStatus(204);
});

app.post('/api/twilio-status-webhook', (req, res) => {
  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = req.body;
  logger.info('Twilio status update', { MessageSid, MessageStatus, ErrorCode, ErrorMessage });
  
  if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
    logger.error('Twilio message failed', { MessageSid, MessageStatus, ErrorCode, ErrorMessage });
  }

  res.sendStatus(204);
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
