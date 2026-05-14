const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllProducts() {
  const products = await prisma.product.findMany({
    include: { productParts: true }
  });

  console.log('--- PRODUCT PARTS SUMMARY ---');
  products.forEach(p => {
    if (p.productParts.length === 0) {
      console.log(`Product "${p.name}" (ID: ${p.id}) has NO PARTS LINKED.`);
    } else {
      console.log(`Product "${p.name}" has ${p.productParts.length} parts.`);
    }
  });

  process.exit(0);
}

checkAllProducts();
