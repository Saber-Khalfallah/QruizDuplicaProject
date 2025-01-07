const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const { validateContent } = require('../middleware/contentValidation');
const {
    createContent,
    getAllContent,
    getContentById,
    updateContent,
    deleteContent,
} = require('../controllers/contentControllers');

/**
 * @swagger
 * tags:
 *   name: Content
 *   description: Endpoints for managing content
 */

/**
 * @swagger
 * /api/content:
 *   get:
 *     summary: Fetch all content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of content.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Content'
 */
router.get('/', authenticateToken, getAllContent);

/**
 * @swagger
 * /api/content/{id}:
 *   get:
 *     summary: Fetch content by ID
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Content ID
 *       - in: query
 *         name: secret_code
 *         schema:
 *           type: string
 *         description: Optional secret code for private content
 *     responses:
 *       200:
 *         description: Content details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Content'
 *       403:
 *         description: Secret code required or invalid
 *       404:
 *         description: Content not found
 */
router.get('/:id', authenticateToken, getContentById);

/**
 * @swagger
 * /api/content:
 *   post:
 *     summary: Create content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContentInput'
 *     responses:
 *       201:
 *         description: Content created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', authenticateToken, validateContent, createContent);

/**
 * @swagger
 * /api/content/{id}:
 *   put:
 *     summary: Update content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Content ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContentInput'
 *     responses:
 *       200:
 *         description: Content updated successfully
 *       404:
 *         description: Content not found
 */
router.put('/:id', authenticateToken, validateContent, updateContent);

/**
 * @swagger
 * /api/content/{id}:
 *   delete:
 *     summary: Delete content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Content ID
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *       404:
 *         description: Content not found
 */
router.delete('/:id', authenticateToken, deleteContent);

module.exports = router;
