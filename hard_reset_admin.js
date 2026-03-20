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
        
        await db.query("DELETE FROM users WHERE email = 'admin@example.com'");
        
        const [res] = await db.query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ['Admin User', 'admin@example.com', '$2b$10$0RppoHU9R.bj/v6F5p5C5eUwNFwbcg8OU1KbjRy4j.MW4VI7Ctst.', 'admin']
        );
        
        console.log(`HARD RESET SUCCESS! admin@example.com is now an admin with password123. Verified Hash used.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
