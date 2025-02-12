import express from 'express';
import cors from 'cors';
import { createBounty, getBountyList, clearBounties, matchBountiesUser } from './lib/nillion/index.js';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Nillion only once
let nillionInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Initialize Nillion on startup
console.log('Starting Nillion initialization...');
initializationPromise = (async () => {
  try {
    // Ensure imports are loaded
    console.log('Checking Nillion imports...');
    const nillionFunctions = { createBounty, getBountyList, clearBounties, matchBountiesUser };
    console.log('Available Nillion functions:', Object.keys(nillionFunctions));
    nillionInitialized = true;
    console.log('Nillion initialization complete');
  } catch (error: unknown) {
    console.error('Failed to initialize Nillion:', error);
    nillionInitialized = false;
    throw new Error(error instanceof Error ? error.message : 'Failed to initialize Nillion');
  }
})();

async function waitForNillionInit() {
  if (!nillionInitialized && initializationPromise) {
    try {
      await initializationPromise;
    } catch (error) {
      console.error('Error waiting for Nillion:', error);
      throw error;
    }
  }
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

// Export the Express app for testing
export { app };

// Export a request handler function for Vercel
export default async function handler(req: any, res: any) {
  console.log(`Handling ${req.method} request to ${req.url}`);
  
  try {
    // Health check endpoint should bypass Nillion initialization
    if (req.url === '/health') {
      return res.json({ status: 'ok' });
    }

    // Set a timeout for the entire handler
    const timeout = 9000; // 9 seconds, leaving 1 second buffer for Vercel's 10s limit
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Handler timeout')), timeout);
    });

    // Race between our handler and the timeout
    await Promise.race([
      (async () => {
        // Wait for Nillion to be ready
        await waitForNillionInit();

        // Handle the request
        return new Promise((resolve, reject) => {
          app(req, res, (err: any) => {
            if (err) {
              console.error('Error in Express handler:', err);
              return reject(err);
            }
            resolve(undefined);
          });
        });
      })(),
      timeoutPromise
    ]);
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
  try {
    await createBounty(req.body);
    res.status(201).json({ message: 'Bounty created successfully' });
  } catch (error) {
    console.error('Failed to create bounty:', error);
    res.status(500).json({ message: 'Failed to create bounty' });
  }
});

// Get all bounties
app.get('/bounties', async (req, res) => {
  try {
    const bounties = await getBountyList();
    res.json(bounties);
  } catch (error) {
    console.error('Failed to get bounties:', error);
    res.status(500).json({ message: 'Failed to get bounties' });
  }
});

// Get bounties matching a user
app.get('/bounties/match/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const matches = await matchBountiesUser(userId);
    res.json(matches);
  } catch (error) {
    console.error('Failed to get matching bounties:', error);
    res.status(500).json({ message: 'Failed to get matching bounties' });
  }
});

// Clear all bounties (for testing)
app.post('/bounties/clear', async (req, res) => {
  try {
    await clearBounties();
    res.json({ message: 'All bounties cleared' });
  } catch (error) {
    console.error('Failed to clear bounties:', error);
    res.status(500).json({ message: 'Failed to clear bounties' });
  }
});


