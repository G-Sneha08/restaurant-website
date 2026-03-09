const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// ============================
// GET /api/cart - fetch all cart items
// ============================
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT cart.id, cart.quantity, menu.id AS menu_id, menu.name, menu.price, menu.image_url,
                    (cart.quantity * menu.price) AS subtotal
             FROM cart
             JOIN menu ON cart.menu_id = menu.id
             WHERE cart.user_id = ?`,
            [req.user.id]
        );

        const totalPrice = rows.reduce((sum, item) => sum + item.subtotal, 0);

        res.json({ items: rows, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================
// POST /api/cart - add item to cart
// ============================
router.post('/', protect, async (req, res) => {
    const { menu_id, quantity } = req.body;

    if (!menu_id || !quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid menu_id or quantity' });
    }

    try {
        // Check if item exists in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND menu_id = ?',
            [req.user.id, menu_id]
        );

        if (existing.length > 0) {
            // update quantity
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            // insert new
            const [menuItem] = await pool.query('SELECT name, price FROM menu WHERE id = ?', [menu_id]);
            if (!menuItem.length) return res.status(404).json({ message: 'Menu item not found' });

            await pool.query(
                'INSERT INTO cart (user_id, menu_id, quantity) VALUES (?, ?, ?)',
                [req.user.id, menu_id, quantity]
            );
        }

        res.status(201).json({ message: 'Item added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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
router.delete('/:id', protect, async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [
            req.params.id,
            req.user.id
        ]);

        if (result.affectedRows === 0) return res.status(404).json({ message: 'Cart item not found' });
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
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

        const [orderResult] = await pool.query('INSERT INTO orders (user_id, total_price) VALUES (?, ?)', [
            req.user.id,
            totalPrice
        ]);
        const orderId = orderResult.insertId;

        const orderValues = cartItems.map(item => [orderId, item.menu_id, item.quantity, item.price]);
        await pool.query('INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES ?', [orderValues]);

        await pool.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        res.json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;