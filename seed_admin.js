const pool = require('./server/config/db');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
    try {
        const password = await bcrypt.hash('admin123', 10);
        await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            ['Chief Management Officer', 'admin@example.com', password, 'admin']
        );
        console.log('Admin user seeded: admin@example.com / admin123');
        process.exit();
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
