import express, { Request, Response } from 'express';
import cors from 'cors';
import { createBounty, getBountyList, clearBounties, matchBountiesUser } from './lib/nillion/index.js';
import userRoutes from '../src/routes/user.routes.js';
import authRoutes from '../src/routes/auth.routes.js';

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
app.use('/api/auth', authRoutes);

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

// Initial initialization attempt
initializeNillion();

// Wait for Nillion to initialize
async function waitForNillionInit() {
  if (nillionInitialized) return;
  
  if (initializationPromise) {
    await initializationPromise;
  } else {
    await initializeNillion();
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

// Export a request handler function for Vercel
export default async function handler(req: any, res: any) {
  try {
    await waitForNillionInit();
    
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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
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
