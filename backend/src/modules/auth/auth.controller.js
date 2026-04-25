// backend/src/modules/auth/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');

exports.register = async (req, res) => {
  const { name, email, password, role, branchId, phone, city } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'CUSTOMER',
        branchId: branchId || null,
        phone: phone || null,
        city: city || null,
      },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET || 'super-secret-crown-eve-center-2026',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      process.env.JWT_SECRET || 'super-secret-crown-eve-center-2026',
      { expiresIn: '1d' }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        branchName: user.branch ? user.branch.name : null
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone }
    });
    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
