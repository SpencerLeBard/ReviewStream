require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const businessName = "XYZ Company";
const toNumber = '+12082302474';

async function sendTestSms(to) {
  const body = `Thanks for visiting ${businessName}. Please reply to this text with your feedback and a star rating out of 5.`;
  const msg = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE,
    to
  });
  console.log('Message SID:', msg.sid);
}

sendTestSms(toNumber).catch(err => console.error('Twilio error:', err));
