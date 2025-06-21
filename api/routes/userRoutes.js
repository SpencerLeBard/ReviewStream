const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// GET current user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Fetch user profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ error: 'Failed to retrieve profile data' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error in /profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET user's company
router.get('/company', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get company associated with this user
    const { data, error } = await supabase
      .from('companies')
      .select('id, name')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching company:', error);
      return res.status(500).json({ error: 'Failed to retrieve company data' });
    }
    
    if (!data) {
      return res.status(404).json({ error: 'No company found for this user' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error in /company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// UPDATE user profile
router.put('/profile', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, email } = req.body;
    
    // Update profile in Supabase
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        name, 
        phone, 
        email,
        updated_at: new Date()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error in updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE or update company for a user
router.post('/company', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, address, website } = req.body;
    
    // First check if company exists
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    let result;
    
    if (existingCompany) {
      // Update existing company
      const { data, error } = await supabase
        .from('companies')
        .update({ 
          name, 
          phone, 
          address, 
          website,
          updated_at: new Date()
        })
        .eq('id', existingCompany.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      // Create new company
      const { data, error } = await supabase
        .from('companies')
        .insert([{ 
          user_id: userId,
          name, 
          phone, 
          address, 
          website,
          created_at: new Date(),
          updated_at: new Date()
        }])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }
    
    res.status(existingCompany ? 200 : 201).json(result);
  } catch (error) {
    console.error('Error managing company:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 