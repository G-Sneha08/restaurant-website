const pool = require('../server/config/db');

async function migrate() {
    console.log("Starting migration v3...");
    
    try {
        // 1. Remove session_id column if it exists
        const [columns] = await pool.query("SHOW COLUMNS FROM cart");
        const hasSessionId = columns.some(col => col.Field === 'session_id');
        
        if (hasSessionId) {
            console.log("Removing session_id from cart...");
            await pool.query("ALTER TABLE cart DROP COLUMN session_id");
        }

        // 2. Ensure item_name column exists (it should, but just in case)
        const hasItemName = columns.some(col => col.Field === 'item_name');
        if (!hasItemName) {
            console.log("Adding item_name to cart...");
            await pool.query("ALTER TABLE cart ADD COLUMN item_name VARCHAR(255) NOT NULL AFTER menu_item_id");
        }

        // 3. Fix existing NULL item_name
        console.log("Updating existing NULL item_name rows...");
        await pool.query(`
            UPDATE cart c
            JOIN menu m ON c.menu_item_id = m.id
            SET c.item_name = m.name
            WHERE c.item_name IS NULL OR c.item_name = ''
        `);

        console.log("Migration v3 successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration v3 failed:", err);
        process.exit(1);
    }
}

migrate();
