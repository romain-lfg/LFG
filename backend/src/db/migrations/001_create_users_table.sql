-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- Privy user ID
  wallet_address TEXT UNIQUE,  -- User's wallet address
  email TEXT,  -- User's email if available
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  metadata JSONB  -- Additional user metadata
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for service role to have full access
CREATE POLICY "Service role has full access"
  ON users
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE users IS 'User profiles linked to Privy authentication';
