// reseedImages.js
// Deletes all existing ProductImage records and re-seeds them
// by matching each product's item_code to the correct image file.
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'crown_eve_center',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Farehanzan@786',
};

const UPLOADS_DIR = path.join(__dirname, '../backend/uploads/parts');

async function reseedImages() {
  const client = new Client(dbConfig);
  await client.connect();

  // 1. Build a set of all image files on disk (lowercased)
  const filesOnDisk = new Set(
    fs.readdirSync(UPLOADS_DIR).map(f => f.toLowerCase())
  );
  console.log(`📂 Found ${filesOnDisk.size} image files on disk.\n`);

  // 2. Delete all existing ProductImage records
  const deleted = await client.query('DELETE FROM "ProductImage"');
  console.log(`🗑️  Deleted all existing ProductImage records.\n`);

  // 3. Fetch all part products with their item_codes
  const res = await client.query(`
    SELECT p.id AS product_id, p.name, pd.item_code
    FROM "Product" p
    JOIN "PartDetail" pd ON pd."productId" = p.id
    WHERE p.product_type = 'part'
    ORDER BY pd.item_code
  `);
  console.log(`🔍 Found ${res.rows.length} part products to process.\n`);

  let inserted = 0;
  let missing = 0;

  for (const row of res.rows) {
    const { product_id, name, item_code } = row;
    const filename = `${item_code}.png`;
    const correctUrl = `/uploads/parts/${filename}`;

    if (filesOnDisk.has(filename.toLowerCase())) {
      await client.query(
        `INSERT INTO "ProductImage" (id, "productId", url, is_primary, sort_order)
         VALUES (gen_random_uuid(), $1, $2, true, 0)`,
        [product_id, correctUrl]
      );
      inserted++;
    } else {
      // No image file found — skip (no broken record)
      missing++;
      if (missing <= 20) {
        console.log(`⚠️  No image file for: ${item_code} (${name})`);
      }
    }
  }

  await client.end();

  console.log('\n═══════════════════════════════════');
  console.log(`✅ Images inserted : ${inserted}`);
  console.log(`📭 No file found   : ${missing}`);
  console.log('═══════════════════════════════════');
  console.log('\n🎉 Image re-seed complete! Refresh your dashboard to see updated images.');
}

reseedImages().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
