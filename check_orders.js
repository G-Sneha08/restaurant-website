const pool = require('./server/config/db');
async function check() {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 3');
        console.log('--- RECENT ORDERS ---');
        orders.forEach(o => {
            console.log(`Order #${o.id}: ${o.item_name} (₹${o.total_amount}) - Status: ${o.status}`);
        });
    } catch (err) {
        console.error('Check failed:', err.message);
    } finally {
        process.exit(0);
    }
}
check();
