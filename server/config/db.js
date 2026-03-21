// server/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * DB CONFIGURATION
 * Using exact variable names as configured in Render/Railway:
 * DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
const dbConfig = process.env.DB_HOST 
    ? {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306', 10),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    }
    : process.env.MYSQL_URL || process.env.DATABASE_URL;

const pool = mysql.createPool(dbConfig);

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [DB_SUCCESS] Secured tunnel established to: ${process.env.DB_NAME} at ${process.env.DB_HOST}`);
        connection.release();
    } catch (err) {
        console.error('❌ [DB_FAILURE] MySQL Connection Error:', err.message);
        console.error('💡 PRO-TIP: Ensure DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD are correct in Render.');
    }
}

testConnection();

module.exports = pool;