import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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
const port = 3001;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
