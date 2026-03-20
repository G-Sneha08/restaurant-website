const pool = require('./server/config/db');

async function promoteAdmin() {
    try {
        const [result] = await pool.query(
            "UPDATE users SET role = 'admin' WHERE email = 'admin@restaurant.com'"
        );
        console.log(`Updated ${result.affectedRows} user(s).`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

promoteAdmin();
