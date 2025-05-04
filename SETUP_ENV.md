# Environment Variables Setup

This project requires environment variables for sensitive data like API keys and credentials. Follow these steps to set up your local environment:

## Twilio Configuration

1. Create a file named `.env` in the server directory
2. Add the following content, replacing the placeholders with your actual credentials:

```
# Twilio credentials
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here

# Server configuration
PORT=5001
```

## Important Security Notes

- NEVER commit your `.env` file to Git
- NEVER hardcode credentials in your source code
- The `.env` file is already added to `.gitignore` to prevent accidental commits

## For Production Deployment

For production environments, set these environment variables using your hosting provider's configuration:

- Heroku: Use the Config Vars in the Settings tab
- Vercel: Use the Environment Variables section in the project settings
- Netlify: Use the Environment section in the site settings

## Getting Twilio Credentials

1. Sign up or log in to [Twilio](https://www.twilio.com/)
2. Navigate to the Console Dashboard
3. Your Account SID and Auth Token are displayed on the dashboard 