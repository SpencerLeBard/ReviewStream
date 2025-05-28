const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
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
    console.error('Error creating review:', error);
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
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Failed to fetch review', error: error.message });
  }
});

module.exports = router; 