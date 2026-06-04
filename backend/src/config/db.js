// Singleton PrismaClient — Neon HTTP driver for Hostinger (blocks WebSocket + TCP 5432).

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

const buildUrl = (raw, { forHttpAdapter = false } = {}) => {
  const cleaned = sanitizeUrl(raw);
  if (!cleaned) return cleaned;
  if (cleaned.includes('connection_limit')) return cleaned;
  const sep = cleaned.includes('?') ? '&' : '?';
  // HTTP adapter: one logical connection; native pool: small limit for shared hosting.
  const params = forHttpAdapter
    ? ['connect_timeout=15']
    : ['connection_limit=5', 'connect_timeout=15'];
  return `${cleaned}${sep}${params.join('&')}`;
};

const shouldUseNeonAdapter = () => {
  if (process.env.PRISMA_NEON_ADAPTER === '0') return false;
  if (process.env.PRISMA_NEON_ADAPTER === '1') return true;
  const url = `${process.env.DATABASE_URL || ''}${process.env.DIRECT_URL || ''}`;
  return url.includes('neon.tech');
};

/** PrismaNeon (Pool) uses WebSocket — fails on Hostinger and most Node 22 setups. Default: HTTP. */
const shouldUseNeonHttpAdapter = () => {
  if (process.env.PRISMA_NEON_HTTP === '0') return false;
  return true;
};

function createPrismaClient() {
  const pooledUrl = buildUrl(process.env.DATABASE_URL, {
    forHttpAdapter: shouldUseNeonHttpAdapter(),
  });
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
    if (shouldUseNeonHttpAdapter()) {
      console.log('[db] PrismaNeonHTTP (HTTPS fetch — no WebSocket/TCP)');
      const { PrismaNeonHTTP } = require('@prisma/adapter-neon');
      const adapter = new PrismaNeonHTTP(pooledUrl);
      return new PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
      });
    }

    console.log('[db] PrismaNeon Pool (WebSocket — requires PRISMA_NEON_HTTP=1 on Hostinger)');
    const { neonConfig } = require('@neondatabase/serverless');
    neonConfig.poolQueryViaFetch = true;
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
