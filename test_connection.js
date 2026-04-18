const mysql = require('mysql2/promise');
require('dotenv').config();

async function test() {
  console.log('Connecting to:', process.env.DB_HOST);
  try {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });
    console.log('✅ Connection successful');
    const [rows] = await connection.execute('SELECT 1 + 1 AS solution');
    console.log('Result:', rows[0].solution);
    await connection.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  }
}

test();
