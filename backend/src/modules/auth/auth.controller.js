// backend/src/modules/auth/auth.controller.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/db');
const {
  OTP_PURPOSE,
  sendVerificationOtp,
  sendPasswordResetOtp,
  findValidOtp,
  markOtpUsed,
} = require('./otp.service');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET env var not set. Server refuses to start.');
}

const sendOtpError = (res, error, fallback = 'Internal server error.') => {
  if (error.statusCode === 429) {
    return res.status(429).json({ message: error.message });
  }
  return res.status(500).json({ message: fallback, error: error.message });
};

exports.register = async (req, res) => {
  const { name, email, password, branchId, phone, city } = req.body;

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
        role: 'CUSTOMER',
        branchId: branchId || null,
        phone: phone || null,
        city: city || null,
        isVerified: false,
      },
    });

    try {
      await sendVerificationOtp(user.email);
    } catch (emailError) {
      const logger = require('../../config/logger');
      logger.error('Failed to send verification email', { error: emailError.message });
      if (emailError.statusCode === 429) {
        return sendOtpError(res, emailError);
      }
    }

    res.status(201).json({
      message: 'OTP sent to your email. Please verify your account.',
      email: user.email,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.statusCode === 429) return sendOtpError(res, error);
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.role === 'CUSTOMER' && !user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        unverified: true,
        email: user.email,
      });
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
        branchName: user.branch ? user.branch.name : null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, branchId: true, phone: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json({ user });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phone },
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
    const otpRecord = await findValidOtp(email, otp, OTP_PURPOSE.VERIFY_EMAIL);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await markOtpUsed(otpRecord.id);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branchId },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
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

    await sendVerificationOtp(user.email);
    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (error) {
    return sendOtpError(res, error, 'Failed to resend OTP.');
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email.' });
    }

    await sendPasswordResetOtp(user.email);
    res.status(200).json({
      message: 'Password reset OTP sent to your email.',
      email: user.email,
    });
  } catch (error) {
    return sendOtpError(res, error, 'Failed to send reset OTP.');
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters.' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otpRecord = await findValidOtp(email, otp, OTP_PURPOSE.PASSWORD_RESET);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await markOtpUsed(otpRecord.id);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password updated successfully. You can log in now.' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
