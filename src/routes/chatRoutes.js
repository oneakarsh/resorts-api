const express = require('express');
const { sendMessage, getConversation, getInbox } = require('../controllers/chatController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Send a message (both users and managers can call; controller enforces role rules)
router.post('/send', authMiddleware, sendMessage);

// Get conversation with another user
router.get('/conversations/:withUserId', authMiddleware, getConversation);

// Get inbox (list of conversation partners)
router.get('/inbox', authMiddleware, getInbox);

module.exports = router;
