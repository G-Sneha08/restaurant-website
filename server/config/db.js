// server/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * DB CONFIGURATION
 * Using exact variable names as configured in Render/Railway:
 * DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false // Required for Railway/Render
    }
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [DB_SUCCESS] Connected to database: ${process.env.DB_NAME}`);
        connection.release();
    } catch (err) {
        console.error('❌ [DB_FAILURE] MySQL Connection Error:', err.message);
    }
}

testConnection();

module.exports = pool;