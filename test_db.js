const pool = require('./server/config/db');

async function checkCart() {
    try {
        const [rows] = await pool.query('DESCRIBE cart');
        console.log('--- CART TABLE SCHEMA ---');
        console.log(JSON.stringify(rows, null, 2));
        
        const [menuItems] = await pool.query('SELECT id, name FROM menu LIMIT 5');
        console.log('--- MENU ITEMS ---');
        console.log(JSON.stringify(menuItems, null, 2));
    } catch (err) {
        console.error('Error checking DB:', err.message);
    } finally {
        const pool = require('./server/config/db');
        pool.end();
    }
}

checkCart();
