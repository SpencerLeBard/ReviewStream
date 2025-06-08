const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const twilio = require('twilio');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
    console.error('Error fetching companies:', error);
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
    console.error('Error fetching company:', error);
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
    console.error('Error fetching company reviews:', error);
    res.status(500).json({ error: 'Failed to fetch company reviews' });
  }
});

// POST send review request
router.post('/:id/send-review', async (req, res) => {
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
    
    let formattedPhone = customerPhone.trim();
    if (/^\+[2-9]\d{9}$/.test(formattedPhone)) {
      formattedPhone = `+1${formattedPhone.substring(1)}`;
    } else if (/^\d{10}$/.test(formattedPhone)) {
      formattedPhone = `+1${formattedPhone}`;
    }

    const msg = await twilioClient.messages.create({
      body: text,
      from: process.env.TWILIO_PHONE,
      to: formattedPhone
    });
    
    // Insert review request into database
    const { error } = await supabase.from('review_requests').insert([{
      company_id: companyId,
      customer_phone: formattedPhone,
      message_sid: msg.sid
    }]);
    
    if (error) throw error;
    
    res.json({ sid: msg.sid });
  } catch (error) {
    console.error('Error sending review request:', error);
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
    console.error('Error fetching company statistics:', error);
    res.status(500).json({ error: 'Failed to fetch company statistics' });
  }
});

module.exports = router; 