const pool = require('./server/config/db');
async function check() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        console.log('--- TABLES ---');
        console.log(JSON.stringify(tables, null, 2));

        const [cols] = await pool.query('DESCRIBE orders');
        console.log('--- ORDERS COLS ---');
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
