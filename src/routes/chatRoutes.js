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
...
 */
router.post('/send', sendMessage);

/**
 * @swagger
 * /api/chat/conversations/{withUserId}:
 *   get:
 *     summary: Get conversation with another user
 *     tags: [Chat]
...
 */
router.get('/conversations/:withUserId', getConversation);

/**
 * @swagger
 * /api/chat/inbox:
 *   get:
 *     summary: Get user inbox
 *     tags: [Chat]
...
 */
router.get('/inbox', getInbox);

module.exports = router;
