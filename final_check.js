const pool = require('./server/config/db');
async function check() {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
        console.log('--- RECENT ORDERS ---');
        console.log(JSON.stringify(orders, null, 2));
        
        const [bookings] = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
        console.log('\n--- RECENT BOOKINGS ---');
        console.log(JSON.stringify(bookings, null, 2));
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        process.exit(0);
    }
}
check();
