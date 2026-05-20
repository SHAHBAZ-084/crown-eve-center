const { PrismaClient } = require('@prisma/client');

// Singleton pattern — prevents connection explosion on serverless cold starts
const globalForPrisma = global;

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient();
}

module.exports = globalForPrisma.prisma;
