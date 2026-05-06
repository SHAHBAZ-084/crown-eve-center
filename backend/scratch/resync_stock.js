// backend/scratch/resync_stock.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resync() {
  console.log('Starting global stock re-sync...');

  // 1. Sync Parts with Inventory totals
  const parts = await prisma.part.findMany();
  for (const part of parts) {
    const total = await prisma.inventory.aggregate({
      where: { partId: part.id },
      _sum: { stock: true }
    });
    const stockCount = total._sum.stock || 0;
    await prisma.part.update({
      where: { id: part.id },
      data: { stock: stockCount }
    });
    console.log(`Updated Part ${part.name}: ${stockCount} total stock`);
  }

  // 2. Sync Products with Part availability
  const products = await prisma.product.findMany({
    include: {
      productParts: {
        include: {
          part: {
            include: {
              inventory: true // This is tricky because product is branch-specific
            }
          }
        }
      }
    }
  });

  for (const product of products) {
    let minStock = Infinity;
    if (product.productParts.length === 0) continue;

    for (const pp of product.productParts) {
      // Find inventory for this part in THIS product's branch
      const inv = await prisma.inventory.findUnique({
        where: {
          branchId_partId: {
            branchId: product.branchId,
            partId: pp.partId
          }
        }
      });
      const partStock = inv?.stock || 0;
      const possibleQty = Math.floor(partStock / pp.quantity);
      if (possibleQty < minStock) minStock = possibleQty;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { stock_qty: minStock === Infinity ? 0 : minStock }
    });
  }

  console.log('Re-sync complete!');
}

resync()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
