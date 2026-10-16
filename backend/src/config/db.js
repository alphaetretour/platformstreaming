const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// For Render.com database connection
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('?schema=public')) {
  // Add schema parameter if not present
  process.env.DATABASE_URL = process.env.DATABASE_URL + '?schema=public';
}

module.exports = prisma;
