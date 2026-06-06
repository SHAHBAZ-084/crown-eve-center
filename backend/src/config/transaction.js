// HTTP-safe transaction helper for Hostinger + Neon.
const prisma = require('./db');
const { supportsInteractiveTransactions, getAdapterMode } = require('./db');

/**
 * Runs `fn(tx)` inside prisma.$transaction when the driver supports it.
 * On PrismaNeonHTTP (Hostinger), runs against the shared client instead.
 */
const runInTransaction = async (fn, options = {}) => {
  if (supportsInteractiveTransactions() && getAdapterMode() !== 'http') {
    return prisma.$transaction((tx) => fn(tx, { interactive: true }), options);
  }
  // HTTP mode: no real transaction, sequential writes, no automatic rollback
  try {
    return await fn(prisma, { interactive: false });
  } catch (err) {
    if (err?.message?.includes('not supported in HTTP')) {
      throw new Error(
        `DB operation failed: a nested prisma.$transaction was called inside runInTransaction on HTTP mode. ` +
        `Pass the existing tx down instead of starting a new transaction. Original: ${err.message}`
      );
    }
    throw err;
  }
};

module.exports = { runInTransaction };
