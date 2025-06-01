// require('dotenv').config();

// const express = require('express');
// const cors    = require('cors');
// const morgan  = require('morgan');
// const twilio  = require('twilio');
// const { createClient } = require('@supabase/supabase-js');

// const app = express();


// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_ANON_KEY     
// );


// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: false })); 
// app.use(morgan('dev'));

// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// //
// app.use('/api/secure', async (req, res, next) => {
//   const jwt = req.headers.authorization?.split(' ')[1];
//   if (!jwt) return res.status(401).json({ error: 'unauthenticated' });

//   const { data, error } = await supabase.auth.getUser(jwt);
//   if (error) return res.status(401).json({ error: 'invalid token' });

//   req.user = data.user;           // now available to route handlers
//   next();
// });



// // const reviewRoutes = require('./routes/reviewRoutes');
// // app.use('/api/reviews', reviewRoutes);

// /* ──────────────────────────────────────────────────────────── */
// /*  POST /api/text-webhook  – Twilio inbound SMS               */
// /* ──────────────────────────────────────────────────────────── */
// app.post('/api/text-webhook', async (req, res) => {
//   const { From, To, Body = '' } = req.body || {};

//   console.log('Inbound SMS:', { From, To, Body });

//   /* 1. Parse optional "X stars" rating (1–5) */
//   let rating = null;
//   const match = Body.match(/\b([1-5])\s*stars?\b/i);
//   if (match) rating = parseInt(match[1], 10);

//   /* 2. Skip insert if Body empty AND no rating */
//   const bodyTrimmed = Body.trim();
//   if (!bodyTrimmed && rating === null) {
//     console.log('🛈 Skipping insert: empty body & no rating');
//     return res
//       .type('text/xml')
//       .send('<Response><Message>Thanks!</Message></Response>');
//   }

//   /* 3. Insert into Supabase */
//   try {
//     const { error } = await supabase
//       .from('reviews')
//       .insert([{
//         phone_from: From,
//         phone_to:   To,
//         body:       bodyTrimmed || null,
//         rating:     rating              
//       }]);

//     if (error) throw error;
//     console.log('Review saved to Supabase');
//   } catch (err) {
//     console.error('Supabase insert failed:', err.message);
//   }

//   /* 4. Respond to Twilio */
//   res
//     .type('text/xml')
//     .send('<Response><Message>Thanks for your feedback!</Message></Response>');
// });


// if (!process.env.VERCEL) {
//   const PORT = process.env.PORT || 5001;
//   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// }

// module.exports = app;



/* DO NOT EVER REMOVE THESE COMMENTS BELOW
// NOTE HALF ****************************************************************
// //
// //npx ngrok http 5001 --domain=relieved-personally-serval.ngrok-free.app
curl -X POST http://localhost:5001/api/send-review \
  -H "Content-Type: application/json" \
  -d '{"customerPhone":"+12082302474"}'
*/


require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const twilio  = require('twilio');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_ANON_KEY
);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

/* ─ secure routes ─ */
app.use('/api/secure', async (req, res, next) => {
  const jwt = req.headers.authorization?.split(' ')[1];
  if (!jwt) return res.status(401).json({ error: 'unauthenticated' });
  const { data, error } = await supabase.auth.getUser(jwt);
  if (error) return res.status(401).json({ error: 'invalid token' });
  req.user = data.user;
  next();
});

/* ─ send review request ─ */
app.post('/api/send-review', async (req, res) => {
  const { customerPhone } = req.body;

  //'Spencer's Company' for testing
  const company_id = 3;

  // fetch company name just for the message body
  const { data: comp } = await supabase
    .from('companies')
    .select('name')
    .eq('id', company_id)
    .single();

  const text = `Thanks for visiting ${comp.name}. Reply with 1-5 stars and feedback.`;

  const msg = await twilioClient.messages.create({
    body: text,
    from: process.env.TWILIO_PHONE,
    to:   customerPhone
  });

  await supabase.from('review_requests').insert([{
    company_id,
    customer_phone: customerPhone,
    message_sid:    msg.sid
  }]);

  res.json({ sid: msg.sid });
});

/* ─ inbound SMS ─ */
app.post('/api/text-webhook', async (req, res) => {
  const { From, Body = '', SmsSid } = req.body || {};

  const { data: reqRow } = await supabase
    .from('review_requests')
    .select('id,company_id')
    .eq('customer_phone', From)
    .eq('responded', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!reqRow) return res.status(400).json({ error: 'no open review request' });

  const ratingMatch = Body.match(/\b([1-5])\s*stars?\b/i);
  const rating      = ratingMatch ? parseInt(ratingMatch[1], 10) : null;
  const bodyText    = Body.trim();
  if (!bodyText && rating === null)
    return res.type('text/xml').send('<Response><Message>Thanks!</Message></Response>');

  const { error } = await supabase.from('reviews').insert([{
    company_id: reqRow.company_id,
    phone_from: From,
    body:       bodyText,
    rating
  }]);
  if (error) console.error('review insert:', error.message);

  await supabase
    .from('review_requests')
    .update({ responded: true, response_sid: SmsSid, rating, body: bodyText })
    .eq('id', reqRow.id);

  res.type('text/xml').send('<Response><Message>Thanks for your feedback!</Message></Response>');
});

/* ─ routes ─ */
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/secure/users', userRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
