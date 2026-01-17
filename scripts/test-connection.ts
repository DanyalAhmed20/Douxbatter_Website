import { config } from 'dotenv';
import { resolve } from 'path';
import mysql from 'mysql2/promise';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Host:', process.env.MYSQL_HOST);
  console.log('User:', process.env.MYSQL_USER);
  console.log('Database:', process.env.MYSQL_DATABASE);

  try {
    const connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
    });

    console.log('\nConnection successful!');

    // Test query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('Test query result:', rows);

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\nExisting tables:', tables);

    await connection.end();
    console.log('\nConnection closed.');
  } catch (error) {
    console.error('\nConnection failed:', error);
  }
}

testConnection();
