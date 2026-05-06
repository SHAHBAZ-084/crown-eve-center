// fixImageMapping.js
// Re-syncs every product's primary image URL to: /uploads/parts/{item_code}.png
// Only updates if the current URL does NOT already match the correct item_code path.
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

async function fixImageMapping() {
  const client = new Client(dbConfig);
  await client.connect();

  console.log('🔍 Fetching all part products with their images and item codes...\n');

  // Get all part products joined with PartDetail (item_code) and their primary image
  const res = await client.query(`
    SELECT 
      p.id AS product_id,
      p.name,
      pd.item_code,
      pi.id AS image_id,
      pi.url AS current_url
    FROM "Product" p
    JOIN "PartDetail" pd ON pd."productId" = p.id
    LEFT JOIN "ProductImage" pi ON pi."productId" = p.id AND pi.is_primary = true
    WHERE p.product_type = 'part'
    ORDER BY pd.item_code
  `);

  const rows = res.rows;
  console.log(`Found ${rows.length} part products.\n`);

  const uploadsFiles = fs.existsSync(UPLOADS_DIR)
    ? fs.readdirSync(UPLOADS_DIR).map(f => f.toLowerCase())
    : [];

  let fixed = 0;
  let skipped = 0;
  let noFile = 0;
  let noImage = 0;

  for (const row of rows) {
    const { product_id, name, item_code, image_id, current_url } = row;
    const correctUrl = `/uploads/parts/${item_code}.png`;
    const fileExists = uploadsFiles.includes(`${item_code.toLowerCase()}.png`);

    if (!image_id) {
      // No image record at all — insert one if file exists
      if (fileExists) {
        await client.query(
          `INSERT INTO "ProductImage" (id, "productId", url, is_primary, sort_order)
           VALUES (gen_random_uuid(), $1, $2, true, 0)`,
          [product_id, correctUrl]
        );
        console.log(`✅ INSERTED image for: ${name} (${item_code})`);
        fixed++;
      } else {
        noFile++;
      }
      continue;
    }

    if (current_url === correctUrl) {
      skipped++;
      continue;
    }

    // Image record exists but URL is wrong — fix it
    if (fileExists) {
      await client.query(
        `UPDATE "ProductImage" SET url = $1 WHERE id = $2`,
        [correctUrl, image_id]
      );
      console.log(`🔧 FIXED: ${name} (${item_code})`);
      console.log(`   Was: ${current_url}`);
      console.log(`   Now: ${correctUrl}\n`);
      fixed++;
    } else {
      // Correct file doesn't exist on disk — clear wrong URL to avoid wrong image
      await client.query(
        `UPDATE "ProductImage" SET url = $1 WHERE id = $2`,
        [correctUrl, image_id]
      );
      console.log(`⚠️  URL corrected but image file missing on disk: ${item_code}.png`);
      noFile++;
    }
  }

  await client.end();

  console.log('\n═══════════════════════════════════');
  console.log(`✅ Fixed   : ${fixed}`);
  console.log(`⏭️  Skipped : ${skipped} (already correct)`);
  console.log(`📂 No file : ${noFile} (image file missing on disk)`);
  console.log('═══════════════════════════════════');
  console.log('\n🎉 Image mapping sync complete!');
}

fixImageMapping().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
