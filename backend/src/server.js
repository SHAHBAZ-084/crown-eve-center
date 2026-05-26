// backend/src/server.js
function serveCrashReport(err) {
  const http = require('http');
  const server = http.createServer((req, res) => {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Crown Eve API Startup Error:\\n\\n' + (err ? err.stack : 'Unknown error'));
  });
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`[fallback] Serving crash report on port ${port}`));
}

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:', err);
  serveCrashReport(err);
});

let app, prisma, logger;
try {
  require('./config/loadEnv');
  app = require('./app');
  prisma = require('./config/db');
  logger = require('./config/logger');
} catch (err) {
  console.error('[FATAL] Initialization error:', err);
  serveCrashReport(err);
  return; // Stop execution of the rest of the file
}
const PORT = process.env.PORT || 3000;
const DB_CONNECT_MS = Number(process.env.DB_CONNECT_TIMEOUT_MS) || 20000;

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  const msg = `Missing env: ${missing.join(', ')}. Set in Hostinger → Node.js → Environment variables.`;
  console.error('[startup]', msg);
  logger.error(msg);
  // Removed process.exit(1) so /health still works even if env is missing
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
app.listen(PORT, () => {
  console.log(`[startup] Crown Eve API listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  logger.info(`Server running on port ${PORT}`);
  connectDatabase().catch((err) => {
    logger.error('Database connection failed — fix DATABASE_URL / Neon and restart', {
      message: err.message,
    });
  });
});
