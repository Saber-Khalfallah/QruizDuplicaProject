const express = require('express');
const router = express.Router();
const { getDashboardOverview } = require('../controllers/dashboardController');
const { authenticateToken, requireAuthenticatedUser } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Fetch dashboard overview
 *     description: Retrieve an overview of the dashboard, including total content, content type breakdown, total participants, average completion rate, and average score. The data returned depends on the user's role (admin or registered user).
 *     tags:
 *       - Dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard overview.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates if the request was successful.
 *                 dashboardOverview:
 *                   type: object
 *                   properties:
 *                     totalContent:
 *                       type: integer
 *                       description: Total number of content items.
 *                     contentTypeBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             description: Content type.
 *                           count:
 *                             type: integer
 *                             description: Count of the content type.
 *                     totalParticipants:
 *                       type: integer
 *                       description: Total number of participants across all content.
 *                     averageCompletionRate:
 *                       type: number
 *                       format: float
 *                       description: Average completion rate of content.
 *                     averageScore:
 *                       type: number
 *                       format: float
 *                       description: Average score of participants.
 *       401:
 *         description: Unauthorized. Token is missing or invalid.
 *       500:
 *         description: Internal server error.
 */
router.get('/', authenticateToken, requireAuthenticatedUser, getDashboardOverview);

module.exports = router;
