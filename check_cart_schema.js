const pool = require('./server/config/db');
async function check() {
    try {
        console.log(`\n--- TABLE: cart ---`);
        const [cols] = await pool.query(`DESCRIBE cart`);
        for (const c of cols) {
            console.log(`${c.Field} | ${c.Type} | ${c.Null}`);
        }
    } catch (err) {
        console.log('SCHEMA_ERROR:' + err.message);
    } finally {
        process.exit(0);
    }
}
check();
