const prisma = require('../lib/prisma');

exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { to: toId, bookingId, content } = req.body;

    if (!toId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Recipient and content are required' });
    }

    const [sender, recipient] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: toId } }),
    ]);

    if (!sender || !recipient) return res.status(404).json({ success: false, message: 'User not found' });

    const allowedPair = () => {
      if (sender.role === 'MANAGER' || sender.role === 'PROPERTY_OWNER') {
        return recipient.role === 'USER' || recipient.role === 'SUPERADMIN';
      }
      if (sender.role === 'USER') {
        return recipient.role === 'MANAGER' || recipient.role === 'PROPERTY_OWNER' || recipient.role === 'SUPERADMIN';
      }
      if (sender.role === 'SUPERADMIN') return true;
      return false;
    };

    if (!allowedPair()) {
      return res.status(403).json({ success: false, message: 'Messaging between these roles is not allowed' });
    }

    const message = await prisma.message.create({
      data: {
        fromId: senderId,
        toId,
        bookingId,
        content
      }
    });

    res.status(201).json({ success: true, message: 'Message sent', data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send message', error: error.message });
  }
};

exports.getConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const otherId = req.params.withUserId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromId: userId, toId: otherId },
          { fromId: otherId, toId: userId },
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        from: { select: { id: true, name: true, email: true, role: true } },
        to: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
};

exports.getInbox = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Find all messages involving the user
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ fromId: userId }, { toId: userId }]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        from: { select: { id: true, name: true, email: true, role: true } },
        to: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    // Group by conversation partner
    const partners = new Map();
    messages.forEach(msg => {
      const partner = msg.fromId === userId ? msg.to : msg.from;
      if (!partners.has(partner.id)) {
        partners.set(partner.id, {
          user: partner,
          lastMessage: msg.content,
          lastAt: msg.createdAt
        });
      }
    });

    const results = Array.from(partners.values());
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch inbox' });
  }
};
