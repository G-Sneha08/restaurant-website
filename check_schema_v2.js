const pool = require('./server/config/db');
async function check() {
    try {
        const [cols] = await pool.query('DESCRIBE orders');
        console.log('--- ORDERS COLS START ---');
        cols.forEach(c => console.log(c.Field));
        console.log('--- ORDERS COLS END ---');
    } catch (err) {
        console.log('SCHEMA_ERROR:' + err.message);
    } finally {
        process.exit(0);
    }
}
check();
