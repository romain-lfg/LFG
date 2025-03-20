-- Script to check and update database schema

-- 1. Check the current structure of User_Profiles table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'User_Profiles';

-- 2. Create users table with the structure expected by the code
-- This will only create the table if it doesn't exist
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    wallet_address TEXT,
    email TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Add any indexes we might need
CREATE INDEX IF NOT EXISTS users_wallet_address_idx ON users (wallet_address);
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);

-- 4. Check the structure of the newly created users table
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'users';
