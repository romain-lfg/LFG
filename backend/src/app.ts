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

async function initializeNillion() {
  if (!nillionInitialized) {
    console.log('Starting Nillion initialization...');
    try {
      // Add any necessary Nillion initialization here if needed
      nillionInitialized = true;
      console.log('Nillion initialization complete');
    } catch (error: unknown) {
      console.error('Failed to initialize Nillion:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to initialize Nillion');
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
  try {
    // Initialize Nillion if not already done
    await initializeNillion();

    // Handle the request
    return await new Promise((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) {
          console.error('Error handling request:', err);
          return reject(err);
        }
        resolve(undefined);
      });
    });
  } catch (error: unknown) {
    console.error('Handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: 'Internal Server Error', details: errorMessage });
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


