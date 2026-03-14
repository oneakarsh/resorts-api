const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Users fetched successfully',
      count: users.length,
      data: users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users', error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(409).json({ success: false, message: 'Email already registered' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || '',
        role: role ? role.toUpperCase() : 'USER',
        creatorId: req.userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const userId = req.params.id;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } }
      });
      if (existingUser) return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone;
    
    if (role) {
      if (req.userRole !== 'SUPERADMIN') return res.status(403).json({ message: 'Only superadmins can change roles' });
      data.role = role.toUpperCase();
    }
    
    if (isActive !== undefined) {
      if (req.userRole !== 'SUPERADMIN') return res.status(403).json({ message: 'Only superadmins can change status' });
      data.isActive = isActive;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.userId) return res.status(400).json({ success: false, message: 'Cannot delete your own account' });

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};
