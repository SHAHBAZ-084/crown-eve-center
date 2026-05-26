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
  assertOtpVerifyLimit,
  clearOtpVerifyAttempts,
} = require('./otp.service');
const { setAuthCookie, clearAuthCookie } = require('../../utils/authCookie');
const { revokeUserTokens } = require('../../utils/tokenRevocation');
const {
  recordFailedLogin,
  clearLoginAttempts,
  isLoginLocked,
  getRemainingLockMessage,
} = require('../../utils/loginAttempts');
const { assertPasswordPolicy } = require('../../utils/passwordPolicy');
const { normalizeRole } = require('../../constants/roles');

const JWT_SECRET = process.env.JWT_SECRET;

const getJwtSecret = () => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET env var not set.');
  }
  return JWT_SECRET;
};

const issueToken = (user) =>
  jwt.sign(
    { id: user.id, role: normalizeRole(user.role), branchId: user.branchId },
    getJwtSecret(),
    { expiresIn: '1d' }
  );
const isProduction = process.env.NODE_ENV === 'production';

const sendSafeError = (res, status, message) => {
  res.status(status).json({ message });
};

const sendOtpError = (res, error, fallback = 'Internal server error.') => {
  if (error.statusCode === 429) {
    return res.status(429).json({ message: error.message });
  }
  if (isProduction) {
    return res.status(500).json({ message: fallback });
  }
  return res.status(500).json({ message: fallback, error: error.message });
};

const buildUserResponse = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: normalizeRole(user.role),
  branchId: user.branchId,
  branchName: user.branch?.name ?? null,
});

const sendAuthResponse = (res, user) => {
  const token = issueToken(user);
  setAuthCookie(res, token);
  return res.status(200).json({
    token,
    user: buildUserResponse(user),
  });
};

const dispatchVerificationOtp = (email) => {
  void sendVerificationOtp(email).catch((err) => {
    logger.error('Background verification OTP failed', { email, error: err.message });
  });
};

const dispatchPasswordResetOtp = (email) => {
  void sendPasswordResetOtp(email).catch((err) => {
    logger.error('Background password-reset OTP failed', { email, error: err.message });
  });
};

exports.register = async (req, res) => {
  const { name, email, password, phone, city } = req.body;

  try {
    assertPasswordPolicy(password);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
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
        branchId: null,
        phone: phone || null,
        city: city || null,
        isVerified: false,
      },
    });

    dispatchVerificationOtp(user.email);

    res.status(201).json({
      message: 'OTP sent to your email. Please verify your account.',
      email: user.email,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (error.statusCode === 429) return sendOtpError(res, error);
    sendSafeError(res, 500, 'Internal server error.');
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (isLoginLocked(email)) {
      return res.status(429).json({ message: getRemainingLockMessage() });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        branchId: true,
        password: true,
        isVerified: true,
        branch: { select: { name: true } },
      },
    });

    if (!user) {
      recordFailedLogin(email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (normalizeRole(user.role) === 'CUSTOMER' && !user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        unverified: true,
        email: user.email,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      recordFailedLogin(email);
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    clearLoginAttempts(email);
    return sendAuthResponse(res, user);
  } catch (error) {
    sendSafeError(res, 500, 'Internal server error.');
  }
};

exports.logout = async (req, res) => {
  if (req.user?.id) {
    revokeUserTokens(req.user.id);
  }
  clearAuthCookie(res);
  res.status(200).json({ message: 'Logged out successfully.' });
};

exports.getMe = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, branchId: true, phone: true },
  });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json({ user: { ...user, role: normalizeRole(user.role) } });
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
    sendSafeError(res, 500, 'Internal server error.');
  }
};

exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const otpDigits = String(otp || '').trim();

  if (!email || !otpDigits) {
    return res.status(400).json({ message: 'Email and OTP are required.' });
  }

  if (!/^\d{6}$/.test(otpDigits)) {
    return res.status(400).json({ message: 'OTP must be a 6-digit code from your email.' });
  }

  try {
    assertOtpVerifyLimit(email);

    const otpRecord = await findValidOtp(email, otpDigits, OTP_PURPOSE.VERIFY_EMAIL);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await markOtpUsed(otpRecord.id);
    clearOtpVerifyAttempts(email);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { branch: { select: { name: true } } },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });

    const token = issueToken(user);
    setAuthCookie(res, token);
    return res.status(200).json({
      message: 'Email verified successfully!',
      token,
      user: buildUserResponse(user),
    });
  } catch (error) {
    if (error.statusCode === 429) {
      return res.status(429).json({ message: error.message });
    }
    sendSafeError(res, 500, 'Internal server error.');
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

    dispatchVerificationOtp(user.email);
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
    if (user) {
      dispatchPasswordResetOtp(user.email);
    }

    res.status(200).json({
      message: 'If an account exists with this email, a password reset code has been sent.',
    });
  } catch (error) {
    return sendOtpError(res, error, 'Failed to send reset OTP.');
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const otpDigits = String(otp || '').trim();

  if (!email || !otpDigits || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
  }

  if (!/^\d{6}$/.test(otpDigits)) {
    return res.status(400).json({ message: 'OTP must be a 6-digit code from your email.' });
  }

  try {
    assertPasswordPolicy(newPassword);
    assertOtpVerifyLimit(email);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const otpRecord = await findValidOtp(email, otpDigits, OTP_PURPOSE.PASSWORD_RESET);
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    await markOtpUsed(otpRecord.id);
    clearOtpVerifyAttempts(email);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    revokeUserTokens(user.id);

    res.status(200).json({ message: 'Password updated successfully. You can log in now.' });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({ message: error.message });
    }
    if (error.statusCode === 429) {
      return res.status(429).json({ message: error.message });
    }
    sendSafeError(res, 500, 'Internal server error.');
  }
};
