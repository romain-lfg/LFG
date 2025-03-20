import express from 'express';
import { NillionController } from '../controllers/nillion.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

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
router.post('/bounties', authenticateUser, async (req, res) => {
  await nillionController.createBounty(req, res);
});

/**
 * @route   GET /api/nillion/user/bounties
 * @desc    Get all bounties owned by the authenticated user
 * @access  Private
 */
router.get('/user/bounties', authenticateUser, async (req, res) => {
  await nillionController.getUserBounties(req, res);
});

/**
 * @route   GET /api/nillion/user/matches
 * @desc    Match the authenticated user with bounties
 * @access  Private
 */
router.get('/user/matches', authenticateUser, async (req, res) => {
  await nillionController.matchUserWithBounties(req, res);
});

export default router;
