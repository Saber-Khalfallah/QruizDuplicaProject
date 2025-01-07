/**
 * @swagger
 * tags:
 *   name: Link Access
 *   description: API for accessing content via shared links
 */

const express = require('express');
const router = express.Router();
const { validateLink } = require('../middleware/linkValidationMiddleware');
const { getContentByLink } = require('../controllers/linkAccessController');

/**
 * @swagger
 * /api/link-access/{link}:
 *   get:
 *     summary: Access content via a shared link
 *     tags: [Link Access]
 *     parameters:
 *       - in: path
 *         name: link
 *         schema:
 *           type: string
 *         required: true
 *         description: Unique identifier for the link
 *       - in: query
 *         name: secretCode
 *         schema:
 *           type: string
 *         required: false
 *         description: Secret code for accessing private content
 *     responses:
 *       200:
 *         description: Successfully accessed content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 content:
 *                   type: object
 *                   properties:
 *                     content_id:
 *                       type: integer
 *                     user_id:
 *                       type: integer
 *                     type:
 *                       type: string
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     settings:
 *                       type: object
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     is_public:
 *                       type: boolean
 *       403:
 *         description: Invalid or missing secret code
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Link or content not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
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
 */

router.get('/:link', validateLink, getContentByLink);

module.exports = router;
