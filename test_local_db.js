const mysql = require('mysql2/promise');

async function checkLocal() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '', // Try empty password first
            database: 'restaurant_db'
        });
        console.log('✅ Connected to local MySQL!');
        await connection.end();
    } catch (err) {
        console.error('❌ Failed to connect to local MySQL:', err.message);
    }
}

checkLocal();
