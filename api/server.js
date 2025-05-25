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


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false })); 
app.use(morgan('dev'));

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


// const reviewRoutes = require('./routes/reviewRoutes');
// app.use('/api/reviews', reviewRoutes);

/* ──────────────────────────────────────────────────────────── */
/*  POST /api/text-webhook  – Twilio inbound SMS               */
/* ──────────────────────────────────────────────────────────── */
app.post('/api/text-webhook', async (req, res) => {
  const { From, To, Body = '' } = req.body || {};

  console.log('Inbound SMS:', { From, To, Body });

  /* 1. Parse optional "X stars" rating (1–5) */
  let rating = null;
  const match = Body.match(/\b([1-5])\s*stars?\b/i);
  if (match) rating = parseInt(match[1], 10);

  /* 2. Skip insert if Body empty AND no rating */
  const bodyTrimmed = Body.trim();
  if (!bodyTrimmed && rating === null) {
    console.log('🛈 Skipping insert: empty body & no rating');
    return res
      .type('text/xml')
      .send('<Response><Message>Thanks!</Message></Response>');
  }

  /* 3. Insert into Supabase */
  try {
    const { error } = await supabase
      .from('reviews')
      .insert([{
        phone_from: From,
        phone_to:   To,
        body:       bodyTrimmed || null,
        rating:     rating              
      }]);

    if (error) throw error;
    console.log('Review saved to Supabase');
  } catch (err) {
    console.error('Supabase insert failed:', err.message);
  }

  /* 4. Respond to Twilio */
  res
    .type('text/xml')
    .send('<Response><Message>Thanks for your feedback!</Message></Response>');
});


if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
