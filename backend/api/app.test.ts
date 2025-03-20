import express from 'express';
import cors from 'cors';
import userRoutes from '../src/routes/user.routes.js';

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://lfg-platform.vercel.app',  // Production frontend
        'http://localhost:3000',  // Allow local frontend to access production API
      ]
    : 'http://localhost:3000',  // Development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow credentials (cookies, authorization headers, etc)
  maxAge: 86400  // Cache preflight requests for 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Register routes
app.use('/api/users', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
