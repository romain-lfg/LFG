-- Create the users table with the structure expected by the code
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT,
    email TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS users_wallet_address_idx ON users (wallet_address);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- Verify the table was created
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'users'
    AND table_schema = 'public'
ORDER BY ordinal_position;
