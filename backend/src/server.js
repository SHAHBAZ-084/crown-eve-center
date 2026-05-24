// backend/src/server.js
require('./config/loadEnv');
const app = require('./app');
const prisma = require('./config/db');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error(
    `Missing env: ${missing.join(', ')}. Set them in Hostinger hPanel → Node.js → Environment variables (do not rely on .env uploads).`
  );
  process.exit(1);
}

async function start() {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connected');
  } catch (err) {
    logger.error('Database connection failed at startup', {
      message: err.message,
      stack: err.stack,
    });
    process.exit(1);
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

start();
