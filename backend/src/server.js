// backend/src/server.js
require('./config/loadEnv');
const app = require('./app');

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

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
