// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Create Company Owner
  const owner = await prisma.user.upsert({
    where: { email: 'owner@crowneve.com' },
    update: {},
    create: {
      email: 'owner@crowneve.com',
      name: 'John Crown',
      password: hashedPassword,
      role: 'COMPANY_OWNER',
    },
  });

  // Create a Branch
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Main Branch',
      location: 'New York',
    },
  });

  // Create some Parts
  await prisma.part.createMany({
    data: [
      { name: 'Shimano Brake Pads', category: 'Brakes', price: 25.0, stock: 100 },
      { name: 'KMC Chain X11', category: 'Drivetrain', price: 35.0, stock: 50 },
      { name: 'Maxxis Ardent Tire', category: 'Tires', price: 65.0, stock: 30 },
    ],
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
