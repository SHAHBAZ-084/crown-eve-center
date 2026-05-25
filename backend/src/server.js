// backend/src/server.js
require('./config/loadEnv');
const app = require('./app');
const prisma = require('./config/db');
const logger = require('./config/logger');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const DB_CONNECT_MS = Number(process.env.DB_CONNECT_TIMEOUT_MS) || 20000;

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  const msg = `Missing env: ${missing.join(', ')}. Set in Hostinger → Node.js → Environment variables.`;
  console.error('[startup]', msg);
  logger.error(msg);
  process.exit(1);
}

async function connectDatabase() {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`Database connection timed out after ${DB_CONNECT_MS}ms`)), DB_CONNECT_MS);
  });

  await Promise.race([
    (async () => {
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;
    })(),
    timeout,
  ]);
  logger.info('Database connected');
}

// Listen first — prevents Hostinger 504 and browser "CORS" false alarms when DB is slow.
app.listen(PORT, HOST, () => {
  console.log(`[startup] Crown Eve API listening on ${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  logger.info(`Server running on ${HOST}:${PORT}`);
  connectDatabase().catch((err) => {
    logger.error('Database connection failed — fix DATABASE_URL / Neon and restart', {
      message: err.message,
    });
  });
});
