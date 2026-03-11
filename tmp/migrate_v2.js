const pool = require('../server/config/db');

async function migrate() {
    try {
        console.log("Starting Phase 2 Database Migration...");

        // 1. Fix order_items
        console.log("Migrating order_items table...");
        const [oiCols] = await pool.query("SHOW COLUMNS FROM order_items");
        const oiNames = oiCols.map(c => c.Field);

        if (oiNames.includes('menu_id') && !oiNames.includes('menu_item_id')) {
            console.log("Renaming menu_id to menu_item_id in order_items...");
            await pool.query("ALTER TABLE order_items CHANGE COLUMN menu_id menu_item_id INT");
        }
        if (!oiNames.includes('created_at')) {
            console.log("Adding created_at to order_items...");
            await pool.query("ALTER TABLE order_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        }

        // 2. Fix cart
        console.log("Migrating cart table...");
        const [cartCols] = await pool.query("SHOW COLUMNS FROM cart");
        const cartNames = cartCols.map(c => c.Field);

        if (cartNames.includes('user_id') && !cartNames.includes('session_id')) {
            console.log("Changing user_id to session_id in cart...");
            // Drop foreign key first if it exists
            try {
                // Find FK name
                const [fks] = await pool.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_NAME = 'cart' AND COLUMN_NAME = 'user_id' AND CONSTRAINT_SCHEMA = DATABASE()
                `);
                if (fks.length > 0) {
                    await pool.query(`ALTER TABLE cart DROP FOREIGN KEY ${fks[0].CONSTRAINT_NAME}`);
                }
            } catch (e) { console.log("No FK to drop or error dropping FK for user_id"); }
            
            await pool.query("ALTER TABLE cart CHANGE COLUMN user_id session_id VARCHAR(255)");
        }

        if (cartNames.includes('menu_id') && !cartNames.includes('menu_item_id')) {
            console.log("Renaming menu_id to menu_item_id in cart...");
            // Drop FK if exists
             try {
                const [fks] = await pool.query(`
                    SELECT CONSTRAINT_NAME 
                    FROM information_schema.KEY_COLUMN_USAGE 
                    WHERE TABLE_NAME = 'cart' AND COLUMN_NAME = 'menu_id' AND CONSTRAINT_SCHEMA = DATABASE()
                `);
                if (fks.length > 0) {
                    await pool.query(`ALTER TABLE cart DROP FOREIGN KEY ${fks[0].CONSTRAINT_NAME}`);
                }
            } catch (e) { console.log("No FK to drop or error dropping FK for menu_id"); }

            await pool.query("ALTER TABLE cart CHANGE COLUMN menu_id menu_item_id INT");
        }

        if (!cartNames.includes('price')) {
            console.log("Adding price to cart...");
            await pool.query("ALTER TABLE cart ADD COLUMN price DECIMAL(10, 2) AFTER quantity");
        }

        if (!cartNames.includes('created_at')) {
            console.log("Adding created_at to cart...");
            await pool.query("ALTER TABLE cart ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
        }

        console.log("Phase 2 Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Phase 2 Migration failed:", err);
        process.exit(1);
    }
}

migrate();
