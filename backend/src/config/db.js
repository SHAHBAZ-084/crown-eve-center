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
  const databaseUrl = buildUrl(process.env.DATABASE_URL);

  if (!databaseUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL: DATABASE_URL is not set.');
    return new PrismaClient();
  }

  if (useNeonAdapter()) {
    const { PrismaNeon } = require('@prisma/adapter-neon');
    const { neonConfig } = require('@neondatabase/serverless');
    const ws = require('ws');

    // Set up WebSocket constructor for Node.js environments without a global WebSocket object
    neonConfig.webSocketConstructor = ws;

    const adapter = new PrismaNeon({ connectionString: databaseUrl });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
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
