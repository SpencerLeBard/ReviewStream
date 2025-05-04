// Download the helper library from https://www.twilio.com/docs/node/install
const twilio = require("twilio"); // Or, for ESM: import twilio from "twilio";

// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

async function createMessage() {
  try {
    const message = await client.messages.create({
      body: "This is the ship that made the Kessel Run in fourteen parsecs?",
      from: "+18557727446",
      to: "+12082302474",
    });

    console.log(message.body);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

createMessage();

// const client = require('twilio')(accountSid, authToken);

// client.messages
//     .create({
//         body: 'Hello from Twilio',
//         from: '+18557727446',
//         to: '+18777804236'
//     })
//     .then(message => console.log(message.sid))
//     .done();