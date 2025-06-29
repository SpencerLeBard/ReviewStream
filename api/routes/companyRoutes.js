const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');
const logger = require('../logger');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Middleware to check user ownership of a company
const authenticateAndCheckCompany = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: No Bearer token provided.' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);

  if (userError || !user) {
    logger.warn('Invalid or expired token presented.', { error: userError });
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }

  const companyId = req.params.id;
  if (!companyId) {
      return res.status(400).json({ error: 'Company ID is required in the URL parameter.' });
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, is_approved')
    .eq('user_id', user.id)
    .eq('id', companyId)
    .single();

  if (companyError || !company) {
    logger.warn('Forbidden access attempt', { userId: user.id, companyId });
    return res.status(403).json({ error: 'Forbidden. You do not have access to this company.' });
  }

  if (!company.is_approved) {
    logger.warn('Unauthorized attempt from a non-approved company.', { userId: user.id, companyId: company.id });
    return res.status(403).json({ error: 'This account is not approved for access.' });
  }

  req.user = user;
  req.company = company;
  next();
};

// GET all companies
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching companies', { error });
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// GET company by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching company', { error, companyId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch company' });
  }
});

// GET reviews for a company
router.get('/:id/reviews', async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Fetch reviews for a specific company from Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching company reviews', { error, companyId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch company reviews' });
  }
});

// POST send review request
router.post('/:id/send-review', authenticateAndCheckCompany, async (req, res) => {
  try {
    const { customerPhone } = req.body;
    const companyId = req.params.id;
    
    // Fetch company name for the message body
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .single();
    
    if (companyError) throw companyError;
    
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    
    const text = `Thanks for visiting ${company.name}. Reply with 1-5 stars and feedback.`;
    
    // Normalize phone number to E.164 format
    const justDigits = (customerPhone || '').replace(/\D/g, '');
    let formattedPhone = `+${justDigits}`;
    if (justDigits.length === 10) {
      // Assume US/Canada number if 10 digits and add +1
      formattedPhone = `+1${justDigits}`;
    }

    const statusCallbackUrl = `${process.env.API_BASE_URL}/api/twilio-status-webhook`;

    const msg = await twilioClient.messages.create({
      body: text,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone,
      statusCallback: statusCallbackUrl
    });

    logger.info('Review request sent', { messageSid: msg.sid, to: formattedPhone, companyId });
    
    // Insert review request into database
    const { error } = await supabase.from('review_requests').insert([{
      company_id: companyId,
      customer_phone: formattedPhone,
      message_sid: msg.sid
    }]);
    
    if (error) throw error;
    
    res.json({ sid: msg.sid });
  } catch (error) {
    logger.error('Error sending review request', { error: error.message, companyId: req.params.id, customerPhone: req.body.customerPhone });
    res.status(500).json({ error: `Failed to send review request: ${error.message}` });
  }
});

// GET company statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const companyId = req.params.id;
    
    // Get company reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('company_id', companyId);
    
    if (reviewsError) throw reviewsError;
    
    // Calculate statistics
    const stats = {
      totalReviews: reviews.length,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0
      }
    };
    
    if (reviews.length > 0) {
      let totalRating = 0;
      
      reviews.forEach(review => {
        if (review.rating) {
          totalRating += review.rating;
          
          // Increment rating count
          if (review.rating >= 1 && review.rating <= 5) {
            stats.ratingDistribution[review.rating]++;
          }
        }
      });
      
      stats.averageRating = (totalRating / reviews.length).toFixed(1);
    }
    
    res.json(stats);
  } catch (error) {
    logger.error('Error fetching company statistics', { error, companyId: req.params.id });
    res.status(500).json({ error: 'Failed to fetch company statistics' });
  }
});

module.exports = router; 