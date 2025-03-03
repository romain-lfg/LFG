import express from 'express';
import { NillionController } from '../controllers/nillion.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();
const nillionController = new NillionController();

/**
 * @route   GET /api/nillion/bounties
 * @desc    Get all bounties
 * @access  Public
 */
router.get('/bounties', async (req, res) => {
  await nillionController.getAllBounties(req, res);
});

/**
 * @route   POST /api/nillion/bounties
 * @desc    Create a new bounty
 * @access  Private
 */
router.post('/bounties', authenticateToken, async (req, res) => {
  await nillionController.createBounty(req, res);
});

/**
 * @route   GET /api/nillion/user/bounties
 * @desc    Get all bounties owned by the authenticated user
 * @access  Private
 */
router.get('/user/bounties', authenticateToken, async (req, res) => {
  await nillionController.getUserBounties(req, res);
});

/**
 * @route   GET /api/nillion/user/matches
 * @desc    Match the authenticated user with bounties
 * @access  Private
 */
router.get('/user/matches', authenticateToken, async (req, res) => {
  await nillionController.matchUserWithBounties(req, res);
});

export default router;
