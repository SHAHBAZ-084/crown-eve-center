// Singleton PrismaClient — Neon HTTP adapter avoids native engine panics on Hostinger.

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const buildUrl = (raw) => {
  if (!raw) return raw;
  if (raw.includes('connection_limit')) return raw;
  const sep = raw.includes('?') ? '&' : '?';
  return `${raw}${sep}connection_limit=5`;
};

// DISABLED: Neon HTTP adapter does NOT support interactive transactions ($transaction).
// Standard Prisma wire protocol works fine with Neon databases on Hostinger.
const useNeonAdapter = () => false;

function createPrismaClient() {
  // Prefer DIRECT_URL (non-pooler) over DATABASE_URL (pooler).
  // Neon's pooler URL (with -pooler in hostname) uses PgBouncer in transaction mode,
  // which breaks Prisma's interactive $transaction(). Direct connections work fine
  // on persistent Node.js servers like Hostinger.
  const rawUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const databaseUrl = buildUrl(rawUrl);

  if (!databaseUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL: DATABASE_URL is not set.');
    return new PrismaClient();
  }

  return new PrismaClient({
    datasources: {
      db: { url: databaseUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

module.exports = globalForPrisma.prisma;
