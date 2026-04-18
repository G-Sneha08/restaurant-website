// server/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

/**
 * DB CONFIGURATION
 * Using exact variable names as configured in Render/Railway:
 * DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 */
// In production/Railway, we must use SSL and prioritize explicit environment variables
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST?.includes('rlwy.net');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10,
    idleTimeout: 60000,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    connectTimeout: 15000 // Add timeout to prevent hanging
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [DB_SUCCESS] Secured tunnel established to: ${process.env.DB_NAME || 'Remote DB'}`);
        connection.release();
    } catch (err) {
        console.error('❌ [DB_FAILURE] MySQL Connection Error:', err.message);
        console.error('💡 PRO-TIP: Ensure DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD are correct in Render/Railway.');
        console.error('Current Config Host:', process.env.DB_HOST);
    }
}

testConnection();

module.exports = pool;