const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Middleware to check if Supabase is initialized
const checkSupabaseInitialized = (req, res, next) => {
  if (!supabase) {
    const errorMessage = 'Server configuration error: Supabase client is not initialized. Check environment variables.';
    logger.error(errorMessage);
    // Use a 400 for POST requests as it's a client-side (config) error leading to the issue.
    const statusCode = req.method === 'POST' ? 400 : 500;
    return res.status(statusCode).json({ message: 'Server configuration error.', error: errorMessage });
  }
  next();
};

router.use(checkSupabaseInitialized);

// GET all reviews
router.get('/', async (req, res) => {
  try {
    // Fetch all reviews from Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching reviews:', { error: error.message });
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
});

// GET reviews by company ID
router.get('/company/:companyId', async (req, res) => {
  try {
    const companyId = req.params.companyId;
    
    // Fetch reviews for a specific company from Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching company reviews:', { error: error.message, companyId: req.params.companyId });
    res.status(500).json({ message: 'Failed to fetch company reviews', error: error.message });
  }
});

// POST new review (this would be called when receiving a text)
router.post('/', async (req, res) => {
  try {
    const { customerName, phoneNumber, rating, reviewText } = req.body;
    
    // Insert new review into Supabase
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ 
        phone_from: phoneNumber,
        body: reviewText,
        rating: rating
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    logger.error('Error creating review:', { error: error.message, body: req.body });
    res.status(400).json({ message: error.message });
  }
});

// GET review by ID
router.get('/:id', async (req, res) => {
  try {
    // Fetch review by ID from Supabase
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    res.json(data);
  } catch (error) {
    logger.error('Error fetching review:', { error: error.message, reviewId: req.params.id });
    res.status(500).json({ message: 'Failed to fetch review', error: error.message });
  }
});

module.exports = router; 