/**
 * Fix mismatched part images end-to-end:
 * 1) Re-parse abc.pdf → processing/images + products.json
 * 2) Re-upload to R2 (overwrites wrong files)
 * 3) Link URLs to all branch products by item_code
 *
 * Run from backend/:  npm run repair:catalog-images
 */
require('../src/config/loadEnv');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const ROOT = path.resolve(__dirname, '../..');
const MANIFEST = path.join(ROOT, 'processing/products.json');
const URLS = path.join(ROOT, 'processing/r2-urls.json');
const BRANCH_IDS = [1, 2];

const slugFor = (branchId, itemCode) =>
  `b${branchId}-${itemCode}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');

async function linkFromManifest() {
  if (!fs.existsSync(MANIFEST)) throw new Error('Missing products.json');
  const { products } = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const urlMap = fs.existsSync(URLS) ? JSON.parse(fs.readFileSync(URLS, 'utf8')) : {};

  let linked = 0;
  let missingProduct = 0;
  let missingUrl = 0;

  for (const p of products) {
    if (!p.item_code || !p.imageFile) continue;
    const url = urlMap[p.item_code];
    if (!url) {
      missingUrl += 1;
      continue;
    }

    for (const branchId of BRANCH_IDS) {
      const slug = slugFor(branchId, p.item_code);
      const product = await prisma.product.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!product) {
        missingProduct += 1;
        continue;
      }
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url,
          is_primary: true,
          sort_order: 0,
        },
      });
      linked += 1;
    }
  }

  console.log('DB linked:', linked, '| missing product:', missingProduct, '| missing R2 url:', missingUrl);
}

async function main() {
  console.log('Step 1/3: Re-parse PDF catalog…');
  execSync('node scripts/parse-pdf-catalog.js', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });

  console.log('\nStep 2/3: Re-upload images to R2 (force overwrite)…');
  execSync('node scripts/upload-catalog-images-r2.js --force', {
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  console.log('\nStep 3/3: Link images in database…');
  await linkFromManifest();

  console.log('\nRepair complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
