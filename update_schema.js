const pool = require('./server/config/db');

async function updateSchema() {
    try {
        console.log('Updating database schema...');
        
        // Fix users table (ensure role exists)
        await pool.query(`
            ALTER TABLE users 
            MODIFY COLUMN role ENUM('user', 'admin') DEFAULT 'user'
        `).catch(err => console.log('Users table update skip or fail:', err.message));

        // Fix cart table
        // Drop old cart if needed or just add/modify columns
        // Let's be aggressive to ensure consistency if the user wants it reliable
        await pool.query('DROP TABLE IF EXISTS cart');
        await pool.query(`
            CREATE TABLE cart (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NULL, 
                menu_item_id INT NOT NULL,
                item_name VARCHAR(255) NULL,
                price DECIMAL(10, 2) NULL,
                quantity INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (menu_item_id) REFERENCES menu(id) ON DELETE CASCADE
            )
        `);
        console.log('Cart table recreated successfully.');

        // Ensure orders table is correct
        await pool.query(`
            DESCRIBE orders
        `).then(([rows]) => {
            const hasItemName = rows.some(r => r.Field === 'item_name');
            if (!hasItemName) {
                return pool.query('ALTER TABLE orders ADD COLUMN item_name TEXT NULL');
            }
        }).catch(err => console.log('Orders table update fail:', err.message));

    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        pool.end();
    }
}

updateSchema();
