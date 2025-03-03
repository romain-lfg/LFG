import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.test file
dotenv.config({ path: join(__dirname, '.env.test') });

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API is working!',
    env: {
      privyAppId: process.env.PRIVY_APP_ID ? 'Set' : 'Not set',
      privyAppSecret: process.env.PRIVY_APP_SECRET ? 'Set' : 'Not set',
      privyPublicKey: process.env.PRIVY_PUBLIC_KEY ? 'Set' : 'Not set',
      supabaseUrl: process.env.SUPABASE_URL ? 'Set' : 'Not set',
      supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set'
    }
  });
});

// Start server
const port = 3002;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
