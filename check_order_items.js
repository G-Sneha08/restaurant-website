const pool = require('./server/config/db');
async function check() {
    try {
        const [cols] = await pool.query('DESCRIBE order_items');
        console.log('--- ORDER_ITEMS COLS START ---');
        cols.forEach(c => console.log(c.Field));
        console.log('--- ORDER_ITEMS COLS END ---');
    } catch (err) {
        console.log('SCHEMA_ERROR:' + err.message);
    } finally {
        process.exit(0);
    }
}
check();
