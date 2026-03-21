const pool = require('./server/config/db');
async function check() {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // wait for DB log noise
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 10');
        console.log('START_ORDERS_LIST');
        if (orders.length === 0) {
            console.log('NO_ORDERS_FOUND');
        } else {
            orders.forEach(o => {
                console.log(`ORDER_ID:${o.id}|USER_ID:${o.user_id}|STATUS:${o.status}|AMOUNT:${o.total_amount}|ITEMS:${o.item_name}`);
            });
        }
        console.log('END_ORDERS_LIST');
    } catch (err) {
        console.log('CHECK_ERROR:' + err.message);
    } finally {
        process.exit(0);
    }
}
check();
