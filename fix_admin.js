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
        
        const [result] = await db.query(
            "UPDATE users SET role = 'admin', password = ? WHERE email = ?",
            ['$2b$10$aTGNnOg3/EfuJh681oqHAOeeU2mmVmCDUzMm7j07JFlNdO4X7eDeqW', 'admin@example.com']
        );
        
        console.log(`Success! Updated ${result.affectedRows} user(s). admin@example.com is now an admin with password123.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
