// ============================
// GET /api/cart - fetch all cart items
// ============================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT * FROM cart ORDER BY created_at DESC`
        );

        const totalPrice = rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        res.json({ success: true, cart: rows, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// POST /api/cart - add item to cart
// ============================
router.post('/', async (req, res) => {
    const { menu_item_id, quantity } = req.body;
    const qty = quantity || 1;

    if (!menu_item_id) {
        return res.status(400).json({ success: false, message: 'Invalid menu_item_id' });
    }

    try {
        // Check if item exists in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE menu_item_id = ?',
            [menu_item_id]
        );

        if (existing.length > 0) {
            // update quantity
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [qty, existing[0].id]);
            res.status(200).json({ success: true, message: 'Cart updated' });
        } else {
            // insert new using SELECT to get name and price from menu
            await pool.query(
                `INSERT INTO cart (menu_item_id, item_name, price, quantity)
                 SELECT id, name, price, ?
                 FROM menu
                 WHERE id = ?`,
                [qty, menu_item_id]
            );
            res.status(201).json({ success: true, message: 'Item added to cart' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// PUT /api/cart/:id - update quantity
// ============================
router.put('/:id', async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    try {
        const [result] = await pool.query(
            'UPDATE cart SET quantity = ? WHERE id = ?',
            [quantity, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });
        res.json({ success: true, message: 'Quantity updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// DELETE /api/cart/:id - delete cart item
// ============================
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });
        res.json({ success: true, message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// DELETE /api/cart - clear all cart items
// ============================
router.delete('/', async (req, res) => {
    try {
        await pool.query('DELETE FROM cart');
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// POST /api/cart/checkout - place order
// ============================
router.post('/checkout', protect, async (req, res) => {
    try {
        const [cartItems] = await pool.query(
            `SELECT * FROM cart`
        );

        if (cartItems.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

        const totalPrice = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

        const [orderResult] = await pool.query('INSERT INTO orders (user_id, total_amount, item_name) VALUES (?, ?, ?)', [
            req.user.id,
            totalPrice,
            cartItems.map(i => i.item_name).join(', ')
        ]);
        const orderId = orderResult.insertId;

        const orderValues = cartItems.map(item => [orderId, item.menu_item_id, item.quantity, item.price]);
        await pool.query('INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES ?', [orderValues]);

        await pool.query('DELETE FROM cart');

        res.json({ success: true, message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;