const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const logger = require('../logger');

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Middleware to authenticate and get user/company info
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, is_approved')
    .eq('user_id', user.id)
    .single();

  if (companyError || !company) {
    return res.status(404).json({ error: 'Company not found for user' });
  }

  if (!company.is_approved) {
    logger.warn('Unauthorized attempt from a non-approved company.', { userId: user.id, companyId: company.id });
    return res.status(403).json({ error: 'This account is not approved for access.' });
  }

  req.user = user;
  req.company = company;
  next();
};

router.use(authenticate);

// GET all contacts for the user's company
router.get('/', async (req, res) => {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .eq('company_id', req.company.id)
    .order('created_at');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// POST a new contact for the user's company
router.post('/', async (req, res) => {
  const { data, error } = await supabase
    .from('contacts')
    .insert([{ ...req.body, company_id: req.company.id }])
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// PATCH an existing contact
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('contacts')
    .update({ ...req.body, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('company_id', req.company.id) // Ensure user can only update their own contacts
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// DELETE a contact
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', id)
    .eq('company_id', req.company.id); // Ensure user can only delete their own contacts
    
  if (error) {
    logger.error('Error deleting contact', { error, contactId: id, companyId: req.company.id });
    return res.status(500).json({ error: error.message });
  }
  logger.info('Contact deleted successfully', { contactId: id, companyId: req.company.id });
  res.json({ ok: true });
});

module.exports = router; 