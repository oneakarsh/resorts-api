const express = require('express');
const { sendMessage, getConversation, getInbox } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All chat routes require authentication
router.use(authMiddleware);

/**
 * @swagger
 * /api/chat/send:
 *   post:
 *     summary: Send a message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 */
router.post('/send', sendMessage);

/**
 * @swagger
 * /api/chat/conversations/{withUserId}:
 *   get:
 *     summary: Get conversation with another user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: withUserId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 */
router.get('/conversations/:withUserId', getConversation);

/**
 * @swagger
 * /api/chat/inbox:
 *   get:
 *     summary: Get user inbox
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inbox retrieved successfully
 */
router.get('/inbox', getInbox);

module.exports = router;
