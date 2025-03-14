import express, { Request, Response } from 'express';
import cors from 'cors';
// Try to import Nillion functions, fall back to mock implementation if it fails
let createBounty, getBountyList, clearBounties, matchBountiesUser;
try {
  const nillionModule = await import('./lib/nillion/index.js');
  createBounty = nillionModule.createBounty;
  getBountyList = nillionModule.getBountyList;
  clearBounties = nillionModule.clearBounties;
  matchBountiesUser = nillionModule.matchBountiesUser;
  console.log('Successfully imported Nillion module');
} catch (error) {
  console.error('Failed to import Nillion module, using fallback implementation:', error);
  const fallbackModule = await import('./lib/nillion/fallback.js');
  createBounty = fallbackModule.createBounty;
  getBountyList = fallbackModule.getBountyList;
  clearBounties = fallbackModule.clearBounties;
  matchBountiesUser = fallbackModule.matchBountiesUser;
}
import userRoutes from '../src/routes/user.routes.js';
import authRoutes from '../src/routes/auth.routes.js';
import nillionRoutes from '../src/routes/nillion.routes.js';
import { supabase } from '../src/config/supabase.js';
import { UserController } from '../src/controllers/user.controller.js';
// Monitoring middleware imports commented out for now as they don't exist
// import { monitoringMiddleware } from '../src/middleware/monitoring.middleware';
// import { monitoring } from '../src/utils/monitoring';

// Create Express app
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://lfg-platform.vercel.app',  // Production frontend
        'http://localhost:3000',  // Allow local frontend to access production API
      ]
    : process.env.NODE_ENV === 'staging'
    ? [
        'https://lfg-frontend-staging.vercel.app',  // Staging frontend
        'http://localhost:3000',  // Allow local frontend to access staging API
      ]
    : 'http://localhost:3000',  // Development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Allow credentials (cookies, authorization headers, etc)
  maxAge: 86400  // Cache preflight requests for 24 hours
};

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 Request: ${req.method} ${req.url}`, {
    headers: req.headers,
    body: req.body,
    path: req.path,
    originalUrl: req.originalUrl
  });
  next();
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Add OPTIONS handling for CORS preflight requests
app.options('*', cors(corsOptions));

// Debug route to test POST requests
app.post('/api/debug/test-post', (req, res) => {
  console.log('Debug test POST received:', {
    body: req.body,
    headers: req.headers
  });
  res.status(200).json({ success: true, message: 'POST request received successfully' });
});

// app.use(monitoringMiddleware); // Commented out as middleware doesn't exist yet

// Initialize monitoring
// monitoring.initialize(); // Commented out as monitoring utility doesn't exist yet

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/nillion', nillionRoutes);

// Initialize Nillion only once
let nillionInitialized = false;
let initializationPromise: Promise<void> | null = null;
let lastInitAttempt = 0;
const INIT_RETRY_INTERVAL = 30000; // 30 seconds

// Helper function to log memory usage
function logMemoryUsage(label: string) {
  if (process.memoryUsage) {
    const memUsage = process.memoryUsage();
    console.log(`[${Date.now()}] Memory usage (${label}):`, {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
    });
  }
}

// Initialize Nillion
async function initializeNillion() {
  const now = Date.now();
  
  // Prevent frequent retry attempts
  if (now - lastInitAttempt < INIT_RETRY_INTERVAL) {
    console.log(`[${now}] Skipping initialization attempt (too soon)`);
    return;
  }
  
  lastInitAttempt = now;
  
  if (nillionInitialized) {
    console.log(`[${now}] Nillion already initialized`);
    return;
  }
  
  if (initializationPromise) {
    console.log(`[${now}] Nillion initialization already in progress`);
    return initializationPromise;
  }
  
  console.log(`[${now}] Starting Nillion initialization`);
  logMemoryUsage('before-nillion-init');
  
  initializationPromise = new Promise<void>(async (resolve, reject) => {
    try {
      // Placeholder for actual initialization
      // In the real implementation, this would initialize the Nillion client
      
      console.log(`[${Date.now()}] Nillion initialized successfully`);
      logMemoryUsage('after-nillion-init');
      nillionInitialized = true;
      resolve();
    } catch (error) {
      console.error(`[${Date.now()}] Failed to initialize Nillion:`, error);
      initializationPromise = null;
      reject(error);
    }
  });
  
  return initializationPromise;
}

// Initial initialization attempt with error handling
try {
  initializeNillion().catch(error => {
    console.error('Nillion initialization failed but application will continue:', error);
    // Mark as initialized anyway to prevent blocking the application
    nillionInitialized = true;
  });
} catch (error) {
  console.error('Error during Nillion initialization attempt but application will continue:', error);
  // Mark as initialized anyway to prevent blocking the application
  nillionInitialized = true;
}

// Wait for Nillion to initialize with timeout
async function waitForNillionInit() {
  if (nillionInitialized) return;
  
  if (initializationPromise) {
    try {
      // Add a timeout to prevent hanging if Nillion initialization takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.warn('Nillion initialization timed out, continuing without it');
          nillionInitialized = true; // Mark as initialized to prevent future waits
          reject(new Error('Nillion initialization timed out'));
        }, 2000); // 2 second timeout
      });
      
      await Promise.race([initializationPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error waiting for Nillion initialization:', error);
      // Mark as initialized anyway to prevent blocking future requests
      nillionInitialized = true;
    }
  } else {
    try {
      // Add a timeout for the initialization as well
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.warn('Nillion initialization timed out, continuing without it');
          nillionInitialized = true;
          reject(new Error('Nillion initialization timed out'));
        }, 2000);
      });
      
      await Promise.race([initializeNillion(), timeoutPromise]);
    } catch (error) {
      console.error('Error initializing Nillion:', error);
      nillionInitialized = true;
    }
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export the Express app for tests and other modules
export { app };

// Export a request handler function for Vercel
export default async function handler(req: any, res: any) {
  try {
    console.log(`🔄 Handler received request: ${req.method} ${req.url}`, {
      path: req.path,
      originalUrl: req.originalUrl,
      headers: req.headers
    });
    
    // Try to wait for Nillion to initialize, but don't block the request if it fails or takes too long
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.warn('Nillion initialization timed out during request handling, continuing without it');
          nillionInitialized = true; // Mark as initialized to prevent future waits
          reject(new Error('Nillion initialization timed out during request handling'));
        }, 1000); // 1 second timeout during request handling
      });
      
      await Promise.race([waitForNillionInit(), timeoutPromise]);
    } catch (error) {
      console.error('Nillion initialization failed or timed out during request handling:', error);
      // Continue processing the request even if Nillion fails
    }
    
    // Special handling for /api/users/sync endpoint
    if (req.url === '/api/users/sync' && req.method === 'POST') {
      console.log('🔍 Direct handling of /api/users/sync POST request');
      
      // Parse the request body if it hasn't been parsed yet
      if (typeof req.body === 'string' || !req.body) {
        try {
          req.body = typeof req.body === 'string' ? JSON.parse(req.body) : {};
        } catch (e) {
          console.error('Error parsing request body:', e);
          req.body = {};
        }
      }
      
      // Directly call the controller method
      const userController = new UserController();
      return userController.syncUser(req, res);
    }
    
    // Special handling for OPTIONS requests to enable CORS
    if (req.method === 'OPTIONS') {
      console.log('🔍 Handling OPTIONS request with CORS headers');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.status(200).end();
    }
    
    // Create a proper Express request handler
    app(req, res);
    
  } catch (error: unknown) {
    console.error('Handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
    }
  }
}

// Root path handler
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'LFG API',
    version: '1.0.0',
    status: 'online',
    environment: process.env.NODE_ENV || 'development',
    endpoints: [
      '/api/users',
      '/api/auth',
      '/api/nillion',
      '/health'
    ]
  });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    // Add CORS headers to ensure this endpoint can be called from any origin
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Check database connection if supabase is available
    let dbStatus = 'unknown';
    let dbResponseTime = null;
    
    if (typeof supabase !== 'undefined') {
      const startTime = Date.now();
      try {
        const { error } = await supabase.from('users').select('count').limit(1);
        dbStatus = error ? 'error' : 'connected';
        dbResponseTime = Date.now() - startTime;
      } catch (error) {
        dbStatus = 'error';
        console.error('Database connection error:', error);
      }
    }
    
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: {
        status: dbStatus,
        responseTime: dbResponseTime
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', error: 'Health check failed' });
  }
});

// Create a bounty
app.post('/bounties', async (req, res) => {
  const startTime = Date.now();
  logMemoryUsage('before-create-bounty');
  try {
    await createBounty(req.body);
    const endTime = Date.now();
    console.log(`[${endTime}] createBounty completed in ${endTime - startTime}ms`);
    logMemoryUsage('after-create-bounty');
    res.status(201).json({ message: 'Bounty created successfully' });
    
    // Suggest garbage collection after response
    if (global.gc) {
      global.gc();
      logMemoryUsage('after-gc');
    }
  } catch (error) {
    const errTime = Date.now();
    console.error(`[${errTime}] Failed to create bounty after ${errTime - startTime}ms:`, error);
    res.status(500).json({ 
      message: 'Failed to create bounty',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all bounties
app.get('/bounties', async (req, res) => {
  const startTime = Date.now();
  try {
    const bounties = await getBountyList();
    const endTime = Date.now();
    console.log(`[${endTime}] getBountyList completed in ${endTime - startTime}ms`);
    res.json(bounties);
  } catch (error) {
    const errTime = Date.now();
    console.error(`[${errTime}] Failed to get bounties after ${errTime - startTime}ms:`, error);
    res.status(500).json({ 
      message: 'Failed to get bounties',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get bounties matching a user
app.get('/bounties/match/:userId', async (req, res) => {
  const startTime = Date.now();
  try {
    const { userId } = req.params;
    const matches = await matchBountiesUser(userId);
    const endTime = Date.now();
    console.log(`[${endTime}] matchBountiesUser completed in ${endTime - startTime}ms`);
    res.json(matches);
  } catch (error) {
    const errTime = Date.now();
    console.error(`[${errTime}] Failed to get matching bounties after ${errTime - startTime}ms:`, error);
    res.status(500).json({ 
      message: 'Failed to get matching bounties',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear all bounties (for testing)
app.post('/bounties/clear', async (req, res) => {
  const startTime = Date.now();
  try {
    await clearBounties();
    const endTime = Date.now();
    console.log(`[${endTime}] clearBounties completed in ${endTime - startTime}ms`);
    res.json({ message: 'All bounties cleared' });
  } catch (error) {
    const errTime = Date.now();
    console.error(`[${errTime}] Failed to clear bounties after ${errTime - startTime}ms:`, error);
    res.status(500).json({ 
      message: 'Failed to clear bounties',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
