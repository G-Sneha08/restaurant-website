const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// ============================
// GET /api/cart - fetch all cart items
// ============================
router.get('/', async (req, res) => {
    const sessionId = req.query.session_id;
    if (!sessionId) return res.status(400).json({ success: false, message: 'session_id is required' });

    try {
        const [rows] = await pool.query(
            `SELECT cart.id, cart.quantity, cart.price, menu.id AS menu_item_id, menu.name, menu.image_url,
                    (cart.quantity * cart.price) AS subtotal
             FROM cart
             JOIN menu ON cart.menu_item_id = menu.id
             WHERE cart.session_id = ?`,
            [sessionId]
        );

        const totalPrice = rows.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

        res.json({ success: true, items: rows, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// POST /api/cart - add item to cart
// ============================
router.post('/', async (req, res) => {
    const { session_id, menu_item_id, quantity } = req.body;

    if (!session_id || !menu_item_id || !quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid session_id, menu_item_id or quantity' });
    }

    try {
        // Check if item exists in cart for this session
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE session_id = ? AND menu_item_id = ?',
            [session_id, menu_item_id]
        );

        if (existing.length > 0) {
            // update quantity
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            // insert new
            const [menuItem] = await pool.query('SELECT price FROM menu WHERE id = ?', [menu_item_id]);
            if (!menuItem.length) return res.status(404).json({ success: false, message: 'Menu item not found' });

            await pool.query(
                'INSERT INTO cart (session_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
                [session_id, menu_item_id, quantity, menuItem[0].price]
            );
        }

        res.status(201).json({ success: true, message: 'Item added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// PUT /api/cart/:id - update quantity
// ============================
router.put('/:id', protect, async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ message: 'Quantity must be at least 1' });

    try {
        const [result] = await pool.query(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cart item not found' });
        res.json({ message: 'Quantity updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
router.delete('/', protect, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
        res.json({ message: 'Cart cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================
// POST /api/cart/checkout - place order
// ============================
router.post('/checkout', protect, async (req, res) => {
    try {
        const [cartItems] = await pool.query(
            `SELECT cart.menu_id, cart.quantity, menu.price
             FROM cart
             JOIN menu ON cart.menu_id = menu.id
             WHERE cart.user_id = ?`,
            [req.user.id]
        );

        if (cartItems.length === 0) return res.status(400).json({ message: 'Cart is empty' });

        const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const [orderResult] = await pool.query('INSERT INTO orders (user_id, total_amount, item_name) VALUES (?, ?, ?)', [
            req.user.id,
            totalPrice,
            cartItems.map(i => i.name).join(', ')
        ]);
        const orderId = orderResult.insertId;

        const orderValues = cartItems.map(item => [orderId, item.menu_id, item.name, item.quantity, item.price]);
        await pool.query('INSERT INTO order_items (order_id, menu_id, item_name, quantity, price) VALUES ?', [orderValues]);

        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        res.json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;