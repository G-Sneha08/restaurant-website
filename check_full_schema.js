const pool = require('./server/config/db');
async function check() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        const tableNames = tables.map(t => Object.values(t)[0]);
        
        for (const tableName of tableNames) {
            console.log(`\n--- TABLE: ${tableName} ---`);
            const [cols] = await pool.query(`DESCRIBE ${tableName}`);
            for (const c of cols) {
                console.log(`${c.Field} | ${c.Type} | ${c.Null}`);
            }
        }
    } catch (err) {
        console.log('SCHEMA_ERROR:' + err.message);
    } finally {
        process.exit(0);
    }
}
check();
