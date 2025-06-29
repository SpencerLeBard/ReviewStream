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
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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

// Middleware to validate Twilio's request signature
const validateTwilioRequest = (req, res, next) => {
  const twilioSignature = req.headers['x-twilio-signature'];
  const fullUrl = new URL(req.originalUrl, process.env.API_BASE_URL).href;
  const params = req.body;

  const requestIsValid = twilio.validateRequest(
    process.env.TWILIO_AUTH_TOKEN,
    twilioSignature,
    fullUrl,
    params
  );

  if (requestIsValid) {
    next();
  } else {
    logger.warn('Invalid Twilio signature received.', { url: fullUrl, ip: req.ip });
    return res.status(403).type('text/plain').send('Forbidden: Invalid Twilio signature');
  }
};

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const companyRoutes = require('./routes/companyRoutes');
app.use('/api/companies', companyRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/secure/users', userRoutes);

const contactsRoutes = require('./routes/contactsRoutes');
app.use('/api/secure/contacts', contactsRoutes);

/* ──────────────────────────── INBOUND SMS WEBHOOK ──────────────────────────── */
app.post('/api/text-webhook', validateTwilioRequest, async (req, res) => {
  const { From, Body = '', SmsSid } = req.body || {};
  logger.info('Received Twilio text webhook', {
    from: From,
    smsSid: SmsSid,
    webhook: {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      headers: req.headers,
      query: req.query,
      body: req.body,
    }
  });

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

app.post('/api/twilio-status-webhook', validateTwilioRequest, (req, res) => {
  const { MessageSid, MessageStatus } = req.body;

  const logDetails = {
    messageSid: MessageSid,
    status: MessageStatus,
    webhook: {
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      headers: req.headers,
      query: req.query,
      body: req.body,
    }
  };

  if (MessageStatus === 'failed' || MessageStatus === 'undelivered') {
    logger.error(`Twilio message failed: ${MessageSid}`, logDetails);
  } else {
    logger.info(`Twilio status update: ${MessageSid} is ${MessageStatus}`, logDetails);
  }

  res.sendStatus(204);
});

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
}

module.exports = app;
