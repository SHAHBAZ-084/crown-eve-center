// backend/src/config/db.js
// Singleton PrismaClient — safe for shared hosting / serverless restarts
// Connection limit is enforced via URL param (?connection_limit=5) to
// prevent exhausting Neon's connection pool on Hostinger shared hosting.

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  if (!process.env.DATABASE_URL) {
    console.error("\x1b[31m%s\x1b[0m", "==========================================================================");
    console.error("\x1b[31m%s\x1b[0m", "CRITICAL ERROR: DATABASE_URL is not defined in process.env!");
    console.error("\x1b[31m%s\x1b[0m", "Please make sure your .env file exists and contains DATABASE_URL.");
    console.error("\x1b[31m%s\x1b[0m", "Current Working Directory: " + process.cwd());
    console.error("\x1b[31m%s\x1b[0m", "==========================================================================");
  }

  // Append connection_limit to DATABASE_URL if not already present
  const buildUrl = (raw) => {
    if (!raw) return raw;
    if (raw.includes('connection_limit')) return raw;
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

