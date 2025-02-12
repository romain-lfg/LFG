import express from 'express';
import cors from 'cors';
import { createBounty, getBountyList, clearBounties, matchBountiesUser } from '../../nillion/src/index.js';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
