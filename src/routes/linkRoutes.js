/**
 * @swagger
 * tags:
 *   name: Links
 *   description: API for managing links associated with content
 */

const express = require('express');
const router = express.Router();
const {
    generateLink,
    getActiveLinks,
    deleteLink,
    updateLinkSettings,
} = require('../controllers/linkController');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/links/all-links:
 *   get:
 *     summary: Get all active links for the user's content
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 links:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       link_id:
 *                         type: integer
 *                       content_id:
 *                         type: integer
 *                       link:
 *                         type: string
 *                       expiration_date:
 *                         type: string
 *                         format: date-time
 *                       max_access:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       type:
 *                         type: string
 */

/**
 * @swagger
 * /api/links/{id}/generate-link:
 *   post:
 *     summary: Generate a unique link for content
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the content
 *     requestBody:
 *       description: Link settings
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *               maxAccess:
 *                 type: integer
 *               secretCode:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully generated the link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 link:
 *                   type: string
 *                 details:
 *                   type: object
 *                   properties:
 *                     link_id:
 *                       type: integer
 *                     content_id:
 *                       type: integer
 *                     expiration_date:
 *                       type: string
 *                       format: date-time
 *                     max_access:
 *                       type: integer
 */

/**
 * @swagger
 * /api/links/delete-link/{link}:
 *   delete:
 *     summary: Delete a specific link
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: link
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the link
 *     responses:
 *       200:
 *         description: Successfully deleted the link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/links/update-link/{link}:
 *   put:
 *     summary: Update link settings
 *     tags: [Links]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: link
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier of the link
 *     requestBody:
 *       description: Updated link settings
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expirationDate:
 *                 type: string
 *                 format: date-time
 *               maxAccess:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Successfully updated the link
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 link:
 *                   type: object
 *                   properties:
 *                     link_id:
 *                       type: integer
 *                     content_id:
 *                       type: integer
 *                     expiration_date:
 *                       type: string
 *                       format: date-time
 *                     max_access:
 *                       type: integer
 */

router.get('/all-links', authenticateToken, getActiveLinks);
router.post('/:id/generate-link', authenticateToken, generateLink);
router.delete('/delete-link/:link', authenticateToken, deleteLink);
router.put('/update-link/:link', authenticateToken, updateLinkSettings);

module.exports = router;
