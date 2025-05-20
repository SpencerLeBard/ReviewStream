require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const path    = require('path');
const twilio  = require('twilio');

const app = express();

app.use(cors());
app.use(express.json());

// parse URL‑encoded bodies for Twilio webhooks:
app.use(
  express.urlencoded({
    extended: false,  // Twilio sends URL‑encoded payloads
  })
);

app.use(morgan('dev'));

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendSms() {
  try {
    const msg = await client.messages.create({
      body: 'Hello World',  
      from: process.env.TWILIO_PHONE,
      to:   '+12082302474'
    });
    console.log('Message Sent:', msg.sid);
  } catch (err) {
    console.error('Twilio error:', err);
  }
}

// ─── YOUR EXISTING ROUTES ──────────────────────────────────────────────────────
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

// ─── INBOUND SMS WEBHOOK ───────────────────────────────────────────────────────
app.post('/api/text-webhook', (req, res) => {
  
  // Twilio posts these fields in req.body:
  const { From, To, Body } = req.body;

  console.log('📩 Inbound SMS received:');
  console.log('   From:', From);
  console.log('   To:  ', To);
  console.log('   Body:', Body);

  // Here you could enqueue a job to save the review, etc.

  // Respond with empty TwiML to acknowledge receipt
  res.type('text/xml').send('<Response></Response>');
});


// ─── START SERVER ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
