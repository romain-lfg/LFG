import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify authentication token
 *     description: Verifies the provided authentication token and returns user information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                 userId:
 *                   type: string
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: Internal server error
 */
router.post('/verify', authenticateUser, authController.verifyToken.bind(authController));

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get current session information
 *     description: Returns information about the current authenticated session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session information retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get('/session', authenticateUser, authController.getSession.bind(authController));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the current session
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/logout', authenticateUser, authController.logout.bind(authController));

export default router;
