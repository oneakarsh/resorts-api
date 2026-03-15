const Message = require('../models/Message');
const User = require('../models/User');

// Send a message between users (manager <-> customer)
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { to, bookingId, content } = req.body;

    if (!to || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }

    // ensure recipient exists
    const recipient = await User.findById(to);
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Recipient not found' });
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return res.status(404).json({ success: false, message: 'Sender not found' });
    }

    // Simple role-based validation: managers/resort owners chat with customers, customers can message managers/resort owners
    const allowedPair = () => {
      if (sender.role === 'resort_manager' || sender.role === 'resort_owner') {
        return recipient.role === 'user' || recipient.role === 'superadmin';
      }
      if (sender.role === 'user') {
        return recipient.role === 'resort_manager' || recipient.role === 'resort_owner' || recipient.role === 'superadmin';
      }
      // allow superadmin to message anyone
      if (sender.role === 'superadmin') return true;
      return false;
    };

    if (!allowedPair()) {
      return res.status(403).json({ success: false, message: 'Messaging between these roles is not allowed' });
    }

    const message = new Message({ from: senderId, to, bookingId, content });
    await message.save();

    res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

// Get conversation between current user and another user
exports.getConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const otherId = req.params.withUserId;

    // validate other user
    const other = await User.findById(otherId);
    if (!other) return res.status(404).json({ success: false, message: 'User not found' });

    const messages = await Message.find({
      $or: [
        { from: userId, to: otherId },
        { from: otherId, to: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate('from', 'name email role')
      .populate('to', 'name email role');

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation', error: error.message });
  }
};

// Simple inbox: list distinct conversation partners with last message
exports.getInbox = async (req, res) => {
  try {
    const userId = req.userId;
    const agg = await Message.aggregate([
      { $match: { $or: [{ from: userId }, { to: userId }] } },
      {
        $project: {
          other: { $cond: [{ $eq: ['$from', userId] }, '$to', '$from'] },
          content: 1,
          createdAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$other',
          lastMessage: { $first: '$content' },
          lastAt: { $first: '$createdAt' },
        },
      },
      { $sort: { lastAt: -1 } },
    ]);

    // populate user info
    const results = await Promise.all(
      agg.map(async (item) => {
        const user = await User.findById(item._id).select('name email role');
        return {
          user,
          lastMessage: item.lastMessage,
          lastAt: item.lastAt,
        };
      })
    );

    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    console.error('Get inbox error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch inbox', error: error.message });
  }
};
