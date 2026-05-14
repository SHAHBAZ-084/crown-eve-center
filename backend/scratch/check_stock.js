const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStock() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'RAFTAR', mode: 'insensitive' } },
    include: { productParts: true }
  });

  console.log('--- PRODUCTS ---');
  products.forEach(p => {
    console.log(`Product: ${p.name}, Stock: ${p.stock_qty}, Parts count: ${p.productParts.length}`);
    p.productParts.forEach(pp => console.log(`  - PartId: ${pp.partId}, Qty: ${pp.quantity}`));
  });

  const inventory = await prisma.inventory.findMany({
    include: { part: { select: { name: true } } }
  });
  console.log('\n--- INVENTORY ---');
  inventory.slice(0, 10).forEach(inv => {
    console.log(`Part: ${inv.part.name}, Stock: ${inv.stock}, BranchId: ${inv.branchId}`);
  });

  process.exit(0);
}

checkStock();
