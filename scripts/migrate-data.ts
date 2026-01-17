/**
 * Data Migration Script
 *
 * This script migrates the static product data from src/lib/data.ts to the MySQL database.
 *
 * Usage:
 * 1. Make sure your .env.local file has the database credentials
 * 2. Run: npx tsx scripts/migrate-data.ts
 *
 * Note: This script will clear existing data before inserting.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import mysql from 'mysql2/promise';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

// Import static data
import { products } from '../src/lib/data';

async function migrate() {
  console.log('Starting data migration...\n');

  // Create connection
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  try {
    console.log('Connected to database.');

    // Clear existing data (in reverse order due to foreign keys)
    console.log('Clearing existing data...');
    await connection.execute('DELETE FROM product_images');
    await connection.execute('DELETE FROM product_variants');
    await connection.execute('DELETE FROM products');
    console.log('Existing data cleared.\n');

    // Insert products
    console.log('Inserting products...');
    for (const product of products) {
      // Insert product
      await connection.execute(
        'INSERT INTO products (id, name, description, category, subcategory, is_active) VALUES (?, ?, ?, ?, ?, ?)',
        [product.id, product.name, product.description, product.category, product.subcategory || null, true]
      );
      console.log(`  - ${product.name}`);

      // Insert variants
      for (const variant of product.variants) {
        await connection.execute(
          'INSERT INTO product_variants (id, product_id, name, price, description) VALUES (?, ?, ?, ?, ?)',
          [variant.id, product.id, variant.name, variant.price, variant.description || null]
        );
      }

      // Insert images
      for (let i = 0; i < product.images.length; i++) {
        await connection.execute(
          'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)',
          [product.id, product.images[i], i]
        );
      }
    }

    console.log(`\nMigration complete! Inserted ${products.length} products.`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await connection.end();
    console.log('Database connection closed.');
  }
}

migrate().catch((error) => {
  console.error('Migration error:', error);
  process.exit(1);
});
