const prisma = require('../../config/db');
const { sendOtpEmail, sendPasswordResetOtpEmail } = require('../../utils/email.service');

const OTP_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_PER_WINDOW = 15;
const OTP_EXPIRY_MS = 10 * 60 * 1000;

const OTP_PURPOSE = {
  VERIFY_EMAIL: 'VERIFY_EMAIL',
  PASSWORD_RESET: 'PASSWORD_RESET',
};

const assertOtpRateLimit = async (email) => {
  const since = new Date(Date.now() - OTP_WINDOW_MS);
  const count = await prisma.otpVerification.count({
    where: { email, createdAt: { gte: since } },
  });
  if (count >= OTP_MAX_PER_WINDOW) {
    const err = new Error('Too many OTP requests. You can request at most 15 codes in 10 minutes. Please wait and try again.');
    err.statusCode = 429;
    throw err;
  }
};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const createOtpRecord = async (email, purpose) => {
  await assertOtpRateLimit(email);
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);
  await prisma.otpVerification.create({
    data: { email, otp, expiresAt, purpose },
  });
  return otp;
};

const sendVerificationOtp = async (email) => {
  const otp = await createOtpRecord(email, OTP_PURPOSE.VERIFY_EMAIL);
  await sendOtpEmail(email, otp);
  return otp;
};

const sendPasswordResetOtp = async (email) => {
  const otp = await createOtpRecord(email, OTP_PURPOSE.PASSWORD_RESET);
  await sendPasswordResetOtpEmail(email, otp);
  return otp;
};

const findValidOtp = async (email, otp, purpose) => {
  const record = await prisma.otpVerification.findFirst({
    where: { email, otp, isUsed: false, purpose },
    orderBy: { createdAt: 'desc' },
  });
  if (!record) return null;
  if (record.expiresAt < new Date()) return null;
  return record;
};

const markOtpUsed = (id) =>
  prisma.otpVerification.update({ where: { id }, data: { isUsed: true } });

module.exports = {
  OTP_PURPOSE,
  OTP_MAX_PER_WINDOW,
  OTP_WINDOW_MS,
  assertOtpRateLimit,
  sendVerificationOtp,
  sendPasswordResetOtp,
  findValidOtp,
  markOtpUsed,
};
