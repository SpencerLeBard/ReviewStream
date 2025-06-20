import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key are required. Make sure they are set in your .env file and prefixed with REACT_APP_");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log('supabase url', process.env.REACT_APP_SUPABASE_URL);