const pool = require('./server/config/db');
async function check() {
    try {
        const [cols] = await pool.query(`DESCRIBE cart`);
        const colNames = cols.map(c => c.Field).join(',');
        console.log(`COLS_CART: ${colNames}`);
    } catch (err) {
        console.log('SCHEMA_ERROR:' + err.message);
    } finally {
        process.exit(0);
    }
}
check();
