// server/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

// Load .env from project root or default
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Create MySQL pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test connection immediately
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Successfully connected to MySQL database');
        connection.release();
    } catch (err) {
        console.error('❌ Error connecting to MySQL database:', err.message);
    }
}

// Only test connection if run directly (for local debugging)
if (require.main === module) {
    testConnection();
}

module.exports = pool;