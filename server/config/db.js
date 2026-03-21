// server/config/db.js
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Diagnostic: Log environment variable presence (but mask the actual secrets)
const diagnostic = {
    DB_HOST: process.env.DB_HOST ? `${process.env.DB_HOST.slice(0, 4)}***` : 'MISSING',
    DB_PORT: process.env.DB_PORT || 'DEFAULT',
    DB_USER: process.env.DB_USER ? `${process.env.DB_USER.slice(0, 2)}***` : 'MISSING',
    DB_NAME: process.env.DB_NAME || 'MISSING',
    HAS_PASS: !!process.env.DB_PASSWORD
};
console.log('📡 [DB_DIAGNOSTIC] Connection attempt with:', diagnostic);

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
        rejectUnauthorized: false
    }
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log(`✅ [DB_SUCCESS] Connected to ${process.env.DB_NAME} at ${process.env.DB_HOST}`);
        connection.release();
    } catch (err) {
        console.error('❌ [DB_FAILURE] Connection error:', err.message);
        console.error('💡 PRO-TIP: Check Render Environment Variables. Ensure DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD match your Railway dashboard.');
    }
}

testConnection();

module.exports = pool;