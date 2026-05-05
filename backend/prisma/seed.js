// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // 1. Create Default Branch
  const branch = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Main Branch',
      location: 'Karachi, Pakistan',
    },
  });

  // 2. Create Company Owner
  await prisma.user.upsert({
    where: { email: 'owner@crowneve.com' },
    update: {},
    create: {
      email: 'owner@crowneve.com',
      name: 'John Crown',
      password: hashedPassword,
      role: 'COMPANY_OWNER',
    },
  });

  // 3. Create Branch Manager
  await prisma.user.upsert({
    where: { email: 'manager@crowneve.com' },
    update: {},
    create: {
      email: 'manager@crowneve.com',
      name: 'Branch Manager',
      password: hashedPassword,
      role: 'BRANCH_MANAGER',
      branchId: branch.id,
    },
  });

  // 4. Create Initial Categories
  const cat1 = await prisma.category.upsert({
    where: { name: 'Electric Bikes' },
    update: {},
    create: { name: 'Electric Bikes', description: 'Full EV motorbikes' },
  });

  const cat2 = await prisma.category.upsert({
    where: { name: 'Spare Parts' },
    update: {},
    create: { name: 'Spare Parts', description: 'Maintenance and repair items' },
  });

  // 5. Create Initial Brands
  await prisma.brand.upsert({
    where: { name: 'Crown EV' },
    update: {},
    create: { name: 'Crown EV', country: 'Pakistan' },
  });

  // 6. Create Service Categories
  await prisma.serviceCategory.upsert({
    where: { name: 'Mechanical' },
    update: {},
    create: { name: 'Mechanical', description: 'Engine and motor related services' },
  });

  console.log('Seeding finished: Owner, Branch, Manager, and initial data created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
