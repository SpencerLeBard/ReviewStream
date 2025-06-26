const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../logger');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Middleware to authenticate and get user
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required: No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    logger.warn('Invalid or expired token.', { error });
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
  req.user = user;
  next();
};

// Apply the authentication middleware to all routes in this file
router.use(authenticate);

// GET user's company settings
router.get('/company', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      logger.error('Error fetching company for user', { error, userId: req.user.id });
      return res.status(500).json({ error: 'Failed to retrieve company data.' });
    }
    if (!data) {
      return res.status(404).json({ error: 'No company found for this user' });
    }
    res.json(data);
  } catch (e) {
    logger.error('Unexpected error in GET /company', { error: e.message, stack: e.stack });
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

// UPDATE user's company settings
router.put('/company', async (req, res) => {
  try {
    const settings = req.body;
    logger.info('Received request to update settings', { userId: req.user.id, settings });

    const { data, error } = await supabase
      .from('companies')
      .update({
        global_auto_send: settings.global_auto_send,
        auto_send_reminders: settings.auto_send_reminders,
        wait_period_days: settings.wait_period_days,
        wait_period_hours: settings.wait_period_hours,
        use_default_message: settings.use_default_message,
        custom_message: settings.custom_message
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating company settings in Supabase', { error, userId: req.user.id });
      return res.status(500).json({ error: 'Failed to update company settings.' });
    }

    logger.info('Successfully updated company settings', { userId: req.user.id, returnedData: data });
    res.json(data);
  } catch (e) {
    logger.error('Unexpected error in PUT /company', { error: e.message, stack: e.stack });
    res.status(500).json({ error: 'An unexpected server error occurred.' });
  }
});

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