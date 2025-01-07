const express = require('express');
const router = express.Router();
const { validateLink } = require('../middleware/linkValidationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
    submitResponse,
    getParticipantContent,
} = require('../controllers/participantController');

/**
 * @swagger
 * tags:
 *   name: Participant
 *   description: API endpoints for participants accessing and submitting responses.
 */

/**
 * @swagger
 * /api/participant/{link}:
 *   get:
 *     summary: Fetch content and elements for participation.
 *     tags: [Participant]
 *     parameters:
 *       - in: path
 *         name: link
 *         required: true
 *         description: Link to access the content.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Content and elements fetched successfully.
 *       404:
 *         description: Content not found or access denied.
 */
router.get('/:link', validateLink, getParticipantContent);

/**
 * @swagger
 * /api/participant/{link}:
 *   post:
 *     summary: Submit responses for participation.
 *     tags: [Participant]
 *     parameters:
 *       - in: path
 *         name: link
 *         required: true
 *         description: Link to access the content.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestName:
 *                 type: string
 *                 description: Required for guests submitting responses.
 *               responses:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     element_id:
 *                       type: integer
 *                       description: The ID of the content element being answered.
 *                     answer:
 *                       type: string
 *                       description: The participant's response.
 *     responses:
 *       201:
 *         description: Responses submitted successfully.
 *       400:
 *         description: Invalid input or responses.
 */
router.post('/:link', validateLink, authenticateToken, submitResponse);

module.exports = router;
