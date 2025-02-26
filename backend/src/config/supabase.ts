import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables should be set in .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema types
export type User = {
  id: string;              // Privy user ID
  wallet_address?: string; // User's wallet address
  email?: string;          // User's email address
  metadata?: any;          // Additional user metadata
  created_at?: string;     // Creation timestamp
  updated_at?: string;     // Last update timestamp
};
