const rateLimit = require('express-rate-limit');
const { rateLimit: limits } = require('../config/authLimits');

const normalizeEmail = (req) => {
  const email = req.body?.email;
  if (typeof email === 'string' && email.trim()) {
    return email.toLowerCase().trim();
  }
  return null;
};

/** Per-email when possible; otherwise per real client IP (requires trust proxy). */
const limiterKey = (req, prefix) => {
  const email = normalizeEmail(req);
  if (email) return `${prefix}:email:${email}`;
  return `${prefix}:ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
};

// Hostinger sets X-Forwarded-For / Forwarded — avoid ValidationError if trust proxy lags on deploy.
const limiterValidate = {
  xForwardedForHeader: false,
  forwardedHeader: false,
};

const loginLimiter = rateLimit({
  windowMs: limits.login.windowMs,
  max: limits.login.max,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  validate: limiterValidate,
  keyGenerator: (req) => limiterKey(req, 'login'),
  message: {
    message: limits.login.windowMs <= 60_000
      ? 'Too many login attempts. Please wait one minute and try again.'
      : 'Too many login attempts for this account. Please try again in 15 minutes.',
  },
});

const registerLimiter = rateLimit({
  windowMs: limits.register.windowMs,
  max: limits.register.max,
  standardHeaders: true,
  legacyHeaders: false,
  validate: limiterValidate,
  keyGenerator: (req) => limiterKey(req, 'register'),
  message: { message: 'Too many registration attempts. Please try again later.' },
});

const otpLimiter = rateLimit({
  windowMs: limits.otp.windowMs,
  max: limits.otp.max,
  standardHeaders: true,
  legacyHeaders: false,
  validate: limiterValidate,
  keyGenerator: (req) => limiterKey(req, 'otp'),
  message: { message: 'Too many OTP requests. Please try again later.' },
});

module.exports = { loginLimiter, registerLimiter, otpLimiter };
