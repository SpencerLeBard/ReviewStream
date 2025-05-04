const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Import routes (to be implemented)
const reviewRoutes = require('./routes/reviewRoutes');

// Routes
app.use('/api/reviews', reviewRoutes);

// Placeholder for text messaging API route
app.post('/api/send-text', (req, res) => {
  const { phoneNumber, message } = req.body;
  
  // TODO: Implement text messaging service integration
  // This would connect to Twilio, MessageBird, or similar service
  console.log(`Would send message: "${message}" to: ${phoneNumber}`);
  
  // Mock successful response
  res.json({ 
    success: true, 
    message: 'Text message sent successfully (placeholder)' 
  });
});

// Handle text message responses (webhook endpoint)
app.post('/api/text-webhook', (req, res) => {
  // TODO: Implement webhook handler for incoming text messages
  // This would parse the incoming message and save to database
  console.log('Received text message response:', req.body);
  
  // Mock response
  res.status(200).send('OK');
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Set port and start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 