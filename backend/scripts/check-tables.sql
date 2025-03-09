-- List all tables in the public schema
SELECT 
    table_name 
FROM 
    information_schema.tables 
WHERE 
    table_schema = 'public';

-- Check if the 'users' table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
);

-- Check if the 'User_Profiles' table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'User_Profiles'
);
