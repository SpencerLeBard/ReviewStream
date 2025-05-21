require('dotenv').config();          
const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const twilio  = require('twilio');
// const supabase = require('./supabaseClient');  // Uncomment once you set up supabaseClient.js

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  // to parse Twilio’s form‑encoded webhooks
app.use(morgan('dev'));

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// TODO: Call helper from here
// async function sendSms(to, body) {
//   try {
//     const msg = await client.messages.create({
//       body,
//       from: process.env.TWILIO_PHONE,
//       to,
//     });
//     console.log(`✅ SMS sent to ${to}. SID: ${msg.sid}`);
//     return msg.sid;
//   } catch (err) {
//     console.error(`❌ Twilio error sending to ${to}:`, err);
//     throw err;
//   }
// }

const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);

//INBOUND SMS WEBHOOK
app.post('/api/text-webhook', async (req, res) => {
  const { From, To, Body } = req.body;
  console.log('📩 Inbound SMS received:');
  console.log('   From:', From);
  console.log('   To:  ', To);
  console.log('   Body:', Body);

  // Optional: parse a numeric rating from “X stars” in the body
  // let rating = null;
  // const match = Body.match(/\b([1-5])\s*stars?\b/i);
  // if (match) rating = parseInt(match[1], 10);

  //Supabase insert
  /*
  try {
    const { error } = await supabase
      .from('reviews')
      .insert({
        phone_from: From,
        phone_to:   To,
        body:       Body,
        rating,     // remove or keep if you uncomment rating parse above
      });
    if (error) throw error;
    console.log('💾 Review saved to Supabase');
  } catch (err) {
    console.error('⚠️ Supabase insert failed:', err.message);
  }
  */

  // Respond to Twilio with empty TwiML to acknowledge receipt
  res.type('text/xml').send('<Response><Message>Thanks for your feedback!</Message></Response>');
});


//START SERVER
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
