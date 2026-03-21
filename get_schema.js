const pool = require('./server/config/db');

async function getFullSchema() {
    try {
        const [tables] = await pool.query('SHOW TABLES');
        for (let t of tables) {
            const tableName = Object.values(t)[0];
            const [cols] = await pool.query(`DESCRIBE \`${tableName}\``);
            console.log(`\n--- TABLE: ${tableName} ---`);
            cols.forEach(c => console.log(`${c.Field}: ${c.Type} (${c.Null === 'YES' ? 'NULL' : 'NOT NULL'})`));
        }
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
        process.exit();
    }
}

getFullSchema();
