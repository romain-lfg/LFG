import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /api/users/sync:
 *   post:
 *     summary: Sync user data with the database
 *     description: Creates a new user if they don't exist, updates if they do
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               walletAddress:
 *                 type: string
 *               email:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: User data synced successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/sync', authenticateUser, userController.syncUser.bind(userController));

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the profile of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/me', authenticateUser, userController.getProfile.bind(userController));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the profile of the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *                 required: true
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.put('/profile', authenticateUser, userController.updateProfile.bind(userController));

/**
 * @swagger
 * /api/users/test-db-connection:
 *   get:
 *     summary: Test database connection
 *     description: Verifies that the Supabase database connection is working correctly
 *     responses:
 *       200:
 *         description: Database connection successful
 *       500:
 *         description: Database connection failed
 */
router.get('/test-db-connection', userController.testDatabaseConnection.bind(userController));

export default router;
