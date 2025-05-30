require('dotenv').config({ path: require('path').join(__dirname, '.env') });

console.log('TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? 'Set' : 'Not set');
console.log('TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? 'Set' : 'Not set');
console.log('TWILIO_PHONE:', process.env.TWILIO_PHONE ? 'Set' : 'Not set'); 