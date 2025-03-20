import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Environment variables should be set in .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log environment variables for debugging (masked for security)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key set:', supabaseKey ? `Yes (starts with ${supabaseKey.substring(0, 10)}...)` : 'No');

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. URL or key is undefined.');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client with error handling
let supabase: SupabaseClient;
try {
  console.log('Creating Supabase client...');
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  console.log('Supabase client created successfully');
} catch (error: unknown) {
  console.error('Error creating Supabase client:', error);
  const errorMessage = error instanceof Error ? error.message : String(error);
  throw new Error(`Failed to create Supabase client: ${errorMessage}`);
}

export { supabase, SupabaseClient };

// Database schema types
export type User = {
  id: string;              // Privy user ID
  wallet_address?: string; // User's wallet address
  email?: string;          // User's email address
  metadata?: any;          // Additional user metadata
  created_at?: string;     // Creation timestamp
  updated_at?: string;     // Last update timestamp
};
