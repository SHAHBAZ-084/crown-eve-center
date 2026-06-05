// HTTP-safe transaction helper for Hostinger + Neon.
const prisma = require('./db');
const { supportsInteractiveTransactions } = require('./db');

/**
 * Runs `fn(tx)` inside prisma.$transaction when the driver supports it.
 * On PrismaNeonHTTP (Hostinger), runs against the shared client instead.
 */
const runInTransaction = async (fn, options = {}) => {
  if (supportsInteractiveTransactions()) {
    return prisma.$transaction((tx) => fn(tx, { interactive: true }), options);
  }
  return fn(prisma, { interactive: false });
};

module.exports = { runInTransaction };
