// Singleton PrismaClient — Neon adapter on production avoids native engine panics
// ("PANIC: timer has gone away") on Hostinger shared Node hosting.

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const buildUrl = (raw) => {
  if (!raw) return raw;
  if (raw.includes('connection_limit')) return raw;
  const sep = raw.includes('?') ? '&' : '?';
  return `${raw}${sep}connection_limit=5`;
};

const useNeonAdapter = () => {
  const url = process.env.DATABASE_URL || '';
  return (
    process.env.PRISMA_NEON_ADAPTER === '1' ||
    url.includes('neon.tech') ||
    url.includes('neon.database')
  );
};

function createPrismaClient() {
  const databaseUrl = buildUrl(process.env.DATABASE_URL);

  if (!databaseUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL: DATABASE_URL is not set.');
    return new PrismaClient();
  }

  if (useNeonAdapter()) {
    const { Pool, neonConfig } = require('@neondatabase/serverless');
    const { PrismaNeon } = require('@prisma/adapter-neon');

    try {
      const ws = require('ws');
      neonConfig.webSocketConstructor = ws;
    } catch {
      // Node 20+ may work without explicit ws; ignore if package missing locally.
    }

    const pool = new Pool({ connectionString: databaseUrl });
    const adapter = new PrismaNeon(pool);
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
