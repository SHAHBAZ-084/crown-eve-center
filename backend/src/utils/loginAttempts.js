const NodeCache = require('node-cache');

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

const attempts = new NodeCache({ stdTTL: LOCKOUT_MS / 1000, checkperiod: 120 });

const getKey = (email) => String(email || '').toLowerCase().trim();

exports.recordFailedLogin = (email) => {
  const key = getKey(email);
  const count = (attempts.get(key) || 0) + 1;
  attempts.set(key, count, LOCKOUT_MS / 1000);
  return count;
};

exports.clearLoginAttempts = (email) => {
  attempts.del(getKey(email));
};

exports.isLoginLocked = (email) => {
  const count = attempts.get(getKey(email)) || 0;
  return count >= MAX_ATTEMPTS;
};

exports.getRemainingLockMessage = () =>
  'Too many failed login attempts. Please try again in 15 minutes.';
