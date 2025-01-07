/**
 * @swagger
 * tags:
 *   name: Content Elements
 *   description: API endpoints for managing content elements
 */

const express = require('express');
const router = express.Router();
const {
    addElements,
    getElements,
    updateElement,
    deleteElement,
} = require('../controllers/contentElementsController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { validateElements } = require('../middleware/contentValidation');

/**
 * @swagger
 * /api/content-elements/{id}/elements:
 *   post:
 *     summary: Add elements to a specific content
 *     tags: [Content Elements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the content to which elements are being added
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               elements:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     element_type:
 *                       type: string
 *                       example: Question
 *                     data:
 *                       type: object
 *                       example: { question: "What is 2 + 2?", options: [2, 3, 4, 5], correct_answer: 4 }
 *     responses:
 *       201:
 *         description: Elements added successfully
 *       400:
 *         description: Validation errors
 *       404:
 *         description: Content not found
 */
router.post('/:id/elements', authenticateToken, validateElements, addElements);

/**
 * @swagger
 * /api/content-elements/{id}/elements:
 *   get:
 *     summary: Get all elements associated with a specific content
 *     tags: [Content Elements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the content
 *     responses:
 *       200:
 *         description: List of elements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   element_id:
 *                     type: integer
 *                   content_id:
 *                     type: integer
 *                   element_type:
 *                     type: string
 *                   data:
 *                     type: object
 *                   position:
 *                     type: integer
 *       404:
 *         description: Content not found
 */
router.get('/:id/elements', authenticateToken, getElements);

/**
 * @swagger
 * /api/content-elements/elements/{elementId}:
 *   put:
 *     summary: Update a specific element
 *     tags: [Content Elements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: elementId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the element to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 description: Updated data for the element
 *                 example: { question: "Updated question?", options: [1, 2, 3, 4], correct_answer: 2 }
 *               position:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Element updated successfully
 *       404:
 *         description: Element not found
 */
router.put('/elements/:elementId', authenticateToken, updateElement);

/**
 * @swagger
 * /api/content-elements/elements/{elementId}:
 *   delete:
 *     summary: Delete a specific element
 *     tags: [Content Elements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: elementId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the element to delete
 *     responses:
 *       200:
 *         description: Element deleted successfully
 *       404:
 *         description: Element not found
 */
router.delete('/elements/:elementId', authenticateToken, deleteElement);

module.exports = router;
