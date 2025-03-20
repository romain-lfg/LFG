import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateUser, hasRole } from '../middleware/auth.middleware.js';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /api/auth/health:
 *   get:
 *     summary: Check auth service health
 *     description: Public endpoint to check if the auth service is running
 *     responses:
 *       200:
 *         description: Auth service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get('/health', (req, res) => {
  console.log('🔑 Auth routes: Health check requested', {
    method: req.method,
    path: req.path,
    userAgent: req.headers['user-agent']
  });
  
  return res.status(200).json({
    status: 'ok',
    message: 'Auth service is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0' // Add version for tracking API compatibility
  });
});

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
 *                   description: Whether the token is valid
 *                 userId:
 *                   type: string
 *                   description: Unique identifier of the authenticated user
 *                 walletAddress:
 *                   type: string
 *                   description: User's wallet address if available
 *                 email:
 *                   type: string
 *                   description: User's email address if available
 *                 discord:
 *                   type: string
 *                   description: User's Discord username if available
 *                 telegram:
 *                   type: string
 *                   description: User's Telegram username if available
 *                 linkedAccounts:
 *                   type: array
 *                   description: List of all linked accounts
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [wallet, email, discord, telegram]
 *                       verified:
 *                         type: boolean
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 */
router.post('/verify', authenticateUser, authController.verifyToken.bind(authController));

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get current session information
 *     description: Returns information about the current authenticated session including user details and claims
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Session information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   description: Whether the session is valid
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *                     email:
 *                       type: string
 *                     discord:
 *                       type: string
 *                     telegram:
 *                       type: string
 *                     linkedAccounts:
 *                       type: array
 *                     customMetadata:
 *                       type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 claims:
 *                   type: object
 *                   description: Raw JWT claims
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/session', authenticateUser, authController.getSession.bind(authController));

/**
 * @swagger
 * components:
 *   responses:
 *     UnauthorizedError:
 *       description: Authentication failed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *               message:
 *                 type: string
 *               code:
 *                 type: string
 *     InternalServerError:
 *       description: Server encountered an error
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *               message:
 *                 type: string
 *               code:
 *                 type: string
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Invalidates the current session. Note that with JWT, this is client-side only.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 code:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/logout', authenticateUser, authController.logout.bind(authController));

export default router;
