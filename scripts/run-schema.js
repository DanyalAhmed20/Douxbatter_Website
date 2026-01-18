const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runSchema() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: true,
  });

  console.log('Connected to database');

  // Read and execute schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await connection.query(schema);
    console.log('Schema executed successfully');

    // Verify tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\nTables in database:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });
  } catch (error) {
    console.error('Error executing schema:', error.message);
  } finally {
    await connection.end();
  }
}

runSchema();
