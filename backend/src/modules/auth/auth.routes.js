// backend/src/modules/auth/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { protect } = require('../../middleware/auth');
const { loginLimiter, registerLimiter, otpLimiter } = require('../../middleware/rateLimit');

const validate = require('../../middleware/validate');
const {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} = require('./auth.schema');

const wrapAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const safeLimiter = (limiter) => (req, res, next) => {
  limiter(req, res, (err) => {
    if (err) {
      const logger = require('../../config/logger');
      logger.warn('Rate limiter skipped', { path: req.path, code: err.code, message: err.message });
      return next();
    }
    next();
  });
};

router.post('/register', safeLimiter(registerLimiter), validate(registerSchema), wrapAsync(authController.register));
router.post('/login', validate(loginSchema), safeLimiter(loginLimiter), wrapAsync(authController.login));
router.post('/verify-otp', safeLimiter(otpLimiter), validate(verifyOtpSchema), wrapAsync(authController.verifyOtp));
router.post('/resend-otp', safeLimiter(otpLimiter), wrapAsync(authController.resendOtp));
router.post('/forgot-password', safeLimiter(otpLimiter), validate(forgotPasswordSchema), wrapAsync(authController.forgotPassword));
router.post('/reset-password', safeLimiter(otpLimiter), validate(resetPasswordSchema), wrapAsync(authController.resetPassword));
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
