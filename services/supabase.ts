import { createClient } from '@supabase/supabase-js';

// Access environment variables securely
const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Key is missing. The app will fail to fetch data. Please check .env file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');