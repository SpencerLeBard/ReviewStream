require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendTestSms() {
  try {
    const msg = await client.messages.create({
      body: 'Thanks for visiting [Business], to review your experience please reply directly to this text with your feedback and number of stars out of 5.' ,
      from: process.env.TWILIO_PHONE,  
      to:   '+12082302474'            
    });
    console.log('Message SID:', msg.sid);
  } catch (err) {
    console.error('Twilio error:', err);
  }
}

sendTestSms();
