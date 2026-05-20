// backend/prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('11223344', 10);

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

  // 2. Technician
  await prisma.user.upsert({
    where: { email: 'tech@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'tech@gmail.com',
      name: 'Expert Technician',
      password: hashedPassword,
      role: 'TECHNICIAN',
      branchId: branch.id,
    },
  });

  // 3. Manager
  await prisma.user.upsert({
    where: { email: 'manager@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'manager@gmail.com',
      name: 'Branch Manager',
      password: hashedPassword,
      role: 'BRANCH_MANAGER',
      branchId: branch.id,
    },
  });

  // 4. Employee
  await prisma.user.upsert({
    where: { email: 'employee@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'employee@gmail.com',
      name: 'Sales Employee',
      password: hashedPassword,
      role: 'EMPLOYEE',
      branchId: branch.id,
    },
  });

  // 5. Customer
  await prisma.user.upsert({
    where: { email: 'customer@gmail.com' },
    update: { password: hashedPassword },
    create: {
      email: 'customer@gmail.com',
      name: 'Valued Customer',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  // 6. Branch Owner
  await prisma.user.upsert({
    where: { email: 'branch@gmail.com' },
    update: { password: hashedPassword, role: 'BRANCH_OWNER' },
    create: {
      email: 'branch@gmail.com',
      name: 'Branch Owner',
      password: hashedPassword,
      role: 'BRANCH_OWNER',
      branchId: branch.id,
    },
  });

  // 7. Company Owner
  await prisma.user.upsert({
    where: { email: 'owner@crowneve.com' },
    update: { password: hashedPassword },
    create: {
      email: 'owner@crowneve.com',
      name: 'Company Owner',
      password: hashedPassword,
      role: 'COMPANY_OWNER',
    },
  });

  // Initial Categories and Brands to keep UI clean
  await prisma.category.upsert({ where: { name: 'Electric Bikes' }, update: {}, create: { name: 'Electric Bikes' } });
  await prisma.brand.upsert({ where: { name: 'Crown EV' }, update: {}, create: { name: 'Crown EV', country: 'Pakistan' } });
  await prisma.serviceCategory.upsert({ where: { name: 'Mechanical' }, update: {}, create: { name: 'Mechanical' } });

  console.log('Seeding finished: All requested accounts created with password 11223344');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
