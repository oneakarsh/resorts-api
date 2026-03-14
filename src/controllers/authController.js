const prisma = require('../lib/prisma');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const generateTokens = async (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET || 'refresh_secret_key',
    { expiresIn: '7d' }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: role ? role.toUpperCase() : 'USER',
      },
    });

    const { accessToken, refreshToken } = await generateTokens(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.json({
      success: true,
      message: 'Login successful',
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ success: false, message: 'Refresh token is required' });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret_key');
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);
    res.json({ success: true, token: accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid refresh token' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expire = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: hashedToken, resetPasswordExpire: expire },
    });

    res.json({ success: true, message: 'Password reset link generated', resetToken });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { gt: new Date() },
      },
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ where: { isActive: true } });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

exports.createPropertyOwner = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const owner = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, role: 'PROPERTY_OWNER', creatorId: req.userId }
    });
    res.status(201).json({ success: true, owner });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create owner' });
  }
};

exports.createManager = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const manager = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, role: 'MANAGER', creatorId: req.userId }
    });
    res.status(201).json({ success: true, manager });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create manager' });
  }
};
