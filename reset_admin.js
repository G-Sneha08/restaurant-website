require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function run() {
    try {
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT)
        });
        
        const [result] = await db.query(
            "UPDATE users SET role = 'admin', password = ? WHERE email = ?",
            [hashedPassword, 'admin@example.com']
        );
        
        if (result.affectedRows === 0) {
           // Create if not exists
           await db.query(
               "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
               ['Admin User', 'admin@example.com', hashedPassword, 'admin']
           );
           console.log("Admin user created successfully.");
        } else {
           console.log("Admin user updated successfully.");
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
