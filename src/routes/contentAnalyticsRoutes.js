const express = require('express');
const router = express.Router();
const { getContentStats } = require('../controllers/contentAnalyticsController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Fetch analytics for a specific content by ID
/**
 * @swagger
 * /api/content-analytics/{id}:
 *   get:
 *     summary: Fetch analytics for a specific content
 *     tags:
 *       - Content Analytics
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the content.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Content analytics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalParticipants:
 *                   type: integer
 *                   description: Total number of participants.
 *                 completionRate:
 *                   type: number
 *                   format: float
 *                   description: Completion rate of the content.
 *                 averageScore:
 *                   type: number
 *                   format: float
 *                   description: Average score of participants.
 *       404:
 *         description: Content not found.
 *       500:
 *         description: Internal server error.
 */
router.get('/:id', authenticateToken, getContentStats);

module.exports = router;
