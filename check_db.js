const pool = require('./server/config/db');
async function run() {
    try {
        const tables = ['cart', 'menu', 'users', 'orders', 'order_items', 'feedback'];
        for (const t of tables) {
            try {
                const [rows] = await pool.query(`DESCRIBE ${t}`);
                console.log(`Table ${t}:`, rows);
            } catch (e) {
                console.error(`Error describing ${t}:`, e.message);
            }
        }
    } catch (err) {
        console.error('Run error:', err);
    } finally {
        pool.end();
    }
}
run();
