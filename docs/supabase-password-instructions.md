# How to Retrieve Your Supabase Database Password

To connect to your Supabase database, you'll need to retrieve your database password from the Supabase dashboard. Follow these steps:

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Select your project "LFG_Database"
3. In the left sidebar, click on "Project Settings"
4. Click on "Database"
5. Under "Connection Info", you'll find your database password or an option to reset it
6. If you need to reset your password:
   - Click on "Reset Database Password"
   - Copy the new password
   - Keep this password secure

Once you have your database password, you can use it to link your local Supabase setup to your remote project:

```bash
cd /Users/romaingodard/Desktop/LFG
supabase link --project-ref kkkwputcwjkuzniuuehq
# When prompted, enter your database password
```

## Alternative: Create a New Staging Database

If you prefer to create a separate staging database instead of using your existing database:

1. Go to the [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Name it "LFG_Staging"
4. Choose your region
5. Set a secure database password (make sure to save this password)
6. Click "Create Project"

After creating the new project, you can link to it:

```bash
cd /Users/romaingodard/Desktop/LFG
supabase link --project-ref your-new-project-ref
# When prompted, enter your database password
```

## Next Steps After Linking

Once you've successfully linked to your Supabase project, you can:

1. Push your database schema:
   ```bash
   supabase db push
   ```

2. Generate TypeScript types for your database:
   ```bash
   supabase gen types typescript --local > ./backend/src/types/supabase.ts
   ```

3. Update your environment variables with the Supabase connection details
