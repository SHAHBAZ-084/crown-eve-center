// backend/src/config/db.js
// Singleton PrismaClient — safe for shared hosting / serverless restarts
// Connection limit is enforced via URL param (?connection_limit=5) to
// prevent exhausting Neon's connection pool on Hostinger shared hosting.

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  // Append connection_limit to DATABASE_URL if not already present
  const buildUrl = (raw) => {
    if (!raw || raw.includes('connection_limit')) return raw;
    const sep = raw.includes('?') ? '&' : '?';
    return `${raw}${sep}connection_limit=5`;
  };

  globalForPrisma.prisma = new PrismaClient({
    datasources: {
      db: { url: buildUrl(process.env.DATABASE_URL) },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

module.exports = globalForPrisma.prisma;

