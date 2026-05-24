// backend/src/modules/auth/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../../config/db');
const { sendOtpEmail } = require('../../utils/email.service');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET env var not set. Server refuses to start.');
}

exports.register = async (req, res) => {
  const { name, email, password, role, branchId, phone, city } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const logger = require('../../config/logger');
      logger.warn('Registration failed: User already exists', { email });
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'CUSTOMER', // Force CUSTOMER role for new registrations
        branchId: branchId || null,
        phone: phone || null,
        city: city || null,
        isVerified: false,
      },
    });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpVerification.create({
      data: {
        email: user.email,
        otp,
        expiresAt,
      }
    });

    // Send verification email
    try {
      await sendOtpEmail(user.email, otp);
    } catch (emailError) {
      const logger = require('../../config/logger');
      logger.error('Failed to send verification email', { error: emailError.message });
      // We still created the user, but email failed. Might want to handle this.
    }

    res.status(201).json({
      message: 'OTP sent to your email. Please verify your account.',
      email: user.email,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.role === 'CUSTOMER' && !user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email before logging in.', unverified: true, email: user.email });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      JWT_SECRET,
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
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, branchId: true, phone: true }
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json({ user });
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

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  try {
    // Find the latest OTP for this email
    const otpRecord = await prisma.otpVerification.findFirst({
      where: { email, otp, isUsed: false },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP as used
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isUsed: true }
    });

    // Update User as verified
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });
    }

    // Generate JWT token so they can be logged in immediately
    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({ 
      message: 'Email verified successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

exports.resendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User is already verified.' });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.otpVerification.create({
      data: {
        email: user.email,
        otp,
        expiresAt,
      }
    });

    await sendOtpEmail(user.email, otp);

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
