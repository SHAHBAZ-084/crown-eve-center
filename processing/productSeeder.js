// productSeeder.js
const { Client } = require('pg');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'crown_eve_center',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'Farehanzan@786',
};

function makeUniqueSlug(name, itemCode) {
    const base = (name || itemCode)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    const code = itemCode.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    return `${base}__${code}`;
}

async function seedProducts() {
    const client = new Client(dbConfig);
    const parts = [];

    await new Promise((resolve, reject) => {
        fs.createReadStream('parts.csv')
            .pipe(csv())
            .on('data', (row) => parts.push(row))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`🌱 Seeding ${parts.length} spare parts into crown_eve_center...`);

    try {
        await client.connect();
        let successCount = 0;
        let skipCount = 0;

        for (const part of parts) {
            try {
                // Skip if item_code already exists
                const checkRes = await client.query(
                    'SELECT id FROM "PartDetail" WHERE item_code = $1',
                    [part.item_code]
                );
                if (checkRes.rows.length > 0) {
                    skipCount++;
                    continue;
                }

                await client.query('BEGIN');

                // Unique slug = name_slug__item_code
                const uniqueSlug = makeUniqueSlug(part.name, part.item_code);
                const productId = uuidv4();

                // 1. Insert into Product
                await client.query(
                    `INSERT INTO "Product" (id, name, slug, product_type, description, price, is_active, "branchId", "createdAt")
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        productId,
                        part.name,
                        uniqueSlug,
                        'part',
                        part.description,
                        parseFloat(part.price) || 0,
                        true,
                        1,
                        new Date()
                    ]
                );

                // 2. Insert into PartDetail
                const partDetailId = uuidv4();
                await client.query(
                    `INSERT INTO "PartDetail" (id, "productId", serial_no, item_code, model, description, cp_price)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        partDetailId,
                        productId,
                        part.serial_no ? parseInt(part.serial_no) : null,
                        part.item_code,
                        part.model,
                        part.description,
                        parseFloat(part.cp_price) || 0
                    ]
                );

                // 3. Insert into ProductImage
                const imageId = uuidv4();
                await client.query(
                    `INSERT INTO "ProductImage" (id, "productId", url, is_primary, sort_order)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [
                        imageId,
                        productId,
                        `/uploads/parts/${part.item_code}.png`,
                        true,
                        0
                    ]
                );

                await client.query('COMMIT');
                successCount++;

                if (successCount % 100 === 0) {
                    console.log(`   ...processed ${successCount} parts`);
                }
            } catch (err) {
                await client.query('ROLLBACK');
                console.error(`❌ Error seeding ${part.item_code}: ${err.message}`);
            }
        }

        console.log(`\n✅ Seeding complete!`);
        console.log(`   Inserted : ${successCount}`);
        console.log(`   Skipped  : ${skipCount} (already exist)`);
        console.log(`🎉 Done!`);

    } catch (err) {
        console.error('Fatal Error:', err.message);
    } finally {
        await client.end();
    }
}

seedProducts();
