require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    try {
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT)
        });
        
        // Delete all admin@example.com users to clear corruption
        await db.query("DELETE FROM users WHERE email = 'admin@example.com'");
        
        // Re-insert with 100% correct data
        const [res] = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Admin User', 'admin@example.com', '$2b$10$aTGNnOg3/EfuJh681oqHAOeeU2mmVmCDUzMm7j07JFlNdO4X7eDeqW', 'admin']
        );
        
        console.log(`HARD RESET SUCCESS! New ID: ${res.insertId}. Role set to admin.`);
        
        // Check ONE more time in the same connection
        const [rows] = await db.query("SELECT email, role FROM users WHERE email = 'admin@example.com'");
        console.log("Verified in DB:", rows[0]);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
