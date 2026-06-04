// Singleton PrismaClient — Neon driver adapter avoids native engine panics on Hostinger/Node 22.

const { PrismaClient } = require('@prisma/client');

const globalForPrisma = global;

const sanitizeUrl = (raw) => {
  if (!raw) return raw;
  // channel_binding breaks many shared hosts (Hostinger) — Neon works with sslmode=require only.
  return raw
    .replace(/([?&])channel_binding=[^&]*&?/gi, '$1')
    .replace(/[?&]$/, '')
    .replace(/\?&/, '?');
};

const buildUrl = (raw) => {
  const cleaned = sanitizeUrl(raw);
  if (!cleaned) return cleaned;
  if (cleaned.includes('connection_limit')) return cleaned;
  const sep = cleaned.includes('?') ? '&' : '?';
  const params = ['connection_limit=5', 'connect_timeout=15'];
  return `${cleaned}${sep}${params.join('&')}`;
};

const shouldUseNeonAdapter = () => {
  if (process.env.PRISMA_NEON_ADAPTER === '0') return false;
  if (process.env.PRISMA_NEON_ADAPTER === '1') return true;
  const url = `${process.env.DATABASE_URL || ''}${process.env.DIRECT_URL || ''}`;
  return url.includes('neon.tech');
};

function createPrismaClient() {
  const pooledUrl = buildUrl(process.env.DATABASE_URL);
  const directUrl = buildUrl(process.env.DIRECT_URL || process.env.DATABASE_URL);

  if (!pooledUrl && !directUrl) {
    console.error('\x1b[31m%s\x1b[0m', 'CRITICAL: DATABASE_URL is not set.');
    return new PrismaClient();
  }

  if (pooledUrl?.includes('neon.tech') && !pooledUrl.includes('pooler')) {
    console.warn(
      '[db] Use Neon pooled DATABASE_URL (*-pooler.neon.tech) on Hostinger to avoid 503/timeouts.'
    );
  }

  if (shouldUseNeonAdapter() && pooledUrl) {
    console.log('[db] Using Neon driver adapter (HTTP fetch transport, no WebSocket)');
    const { neonConfig } = require('@neondatabase/serverless');
    neonConfig.fetchConnectionCache = true;
    neonConfig.useSecureWebSocket = false;
    neonConfig.pipelineTLS = false;
    neonConfig.pipelineConnect = false;

    const { PrismaNeon } = require('@prisma/adapter-neon');
    const adapter = new PrismaNeon({ connectionString: pooledUrl });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  console.log('[db] Using native Prisma engine');
  return new PrismaClient({
    datasources: {
      db: { url: directUrl },
    },
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = createPrismaClient();
}

module.exports = globalForPrisma.prisma;
