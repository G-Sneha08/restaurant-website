const pool = require('../server/config/db');

async function migrate_v4() {
    console.log("Starting migration v4: Ensuring Cart can handle Guest items...");
    
    try {
        // 1. Check cart schema
        const [columns] = await pool.query("SHOW COLUMNS FROM cart");
        const userIdCol = columns.find(col => col.Field === 'user_id');
        
        // 2. Modify user_id to be NULLable if it's currently NOT NULL
        if (userIdCol && userIdCol.Null === 'NO') {
            console.log("Making user_id column NULLable in cart table...");
            // We must temporarily disable foreign keys to change the column nullability easily in some MySQL versions
            // but for a simple NULL change it's usually fine.
            await pool.query("ALTER TABLE cart MODIFY COLUMN user_id INT NULL");
            console.log("Successfully updated user_id to be NULLable.");
        } else {
            console.log("user_id is already NULLable or column not found.");
        }

        console.log("Migration v4 successful.");
        process.exit(0);
    } catch (err) {
        console.error("Migration v4 failed:", err);
        process.exit(1);
    }
}

migrate_v4();
