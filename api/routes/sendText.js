require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendTestSms() {
  try {
    const msg = await client.messages.create({
      body: 'Hello World',  
      from: process.env.TWILIO_PHONE,  // 4) Your Twilio local number
      to:   '+12082302474'             // 5) Your verified personal cell
    });
    console.log('Message SID:', msg.sid);
  } catch (err) {
    console.error('Twilio error:', err);
  }
}

sendTestSms();
