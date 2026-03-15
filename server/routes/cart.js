// server/routes/cart.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL pool from /config/db.js

// ============================
// GET /api/cart - fetch all cart items
// ============================
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT c.id, c.menu_item_id, c.quantity, m.name AS item_name, m.price, c.created_at
             FROM cart c
             JOIN menu m ON c.menu_item_id = m.id
             ORDER BY c.created_at DESC`
        );

        const totalPrice = rows.reduce(
            (sum, item) => sum + parseFloat(item.price) * item.quantity,
            0
        );

        res.json({ success: true, cart: rows, totalPrice });
    } catch (err) {
        console.error("Fetch cart error:", err);
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
        return res.status(400).json({ success: false, message: 'menu_item_id is required' });
    }

    try {
        // Check if item already exists in cart
        const [existing] = await pool.query('SELECT * FROM cart WHERE menu_item_id = ?', [menu_item_id]);

        if (existing.length > 0) {
            // Update quantity if exists
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [qty, existing[0].id]);
            return res.status(200).json({ success: true, message: 'Cart updated' });
        } else {
            // Insert new item
            const [menuItem] = await pool.query('SELECT name, price FROM menu WHERE id = ?', [menu_item_id]);
            if (menuItem.length === 0) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }

            await pool.query(
                'INSERT INTO cart (menu_item_id, quantity, item_name, price) VALUES (?, ?, ?, ?)',
                [menu_item_id, qty, menuItem[0].name, menuItem[0].price]
            );

            return res.status(201).json({ success: true, message: 'Item added to cart' });
        }
    } catch (err) {
        console.error("Add to cart error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// PUT /api/cart/:id - update quantity
// ============================
router.put('/:id', async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    try {
        const [result] = await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        res.json({ success: true, message: 'Quantity updated' });
    } catch (err) {
        console.error("Update cart quantity error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// DELETE /api/cart/:id - delete cart item
// ============================
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Cart item not found' });
        }
        res.json({ success: true, message: 'Item removed from cart' });
    } catch (err) {
        console.error("Delete cart item error:", err);
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
        console.error("Clear cart error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ============================
// POST /api/cart/checkout - place order
// ============================
router.post('/checkout', async (req, res) => {
    try {
        const [cartItems] = await pool.query('SELECT * FROM cart');
        if (cartItems.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const totalAmount = cartItems.reduce(
            (sum, item) => sum + parseFloat(item.price) * item.quantity,
            0
        );

        const itemNames = cartItems.map(item => item.item_name).join(', ');

        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, item_name, total_amount) VALUES (?, ?, ?)',
            [null, itemNames, totalAmount]
        );
        const orderId = orderResult.insertId;

        // Insert into order_items
        const orderValues = cartItems.map(item => [
            orderId,
            item.menu_item_id,
            item.item_name,
            item.quantity,
            item.price
        ]);
        await pool.query(
            'INSERT INTO order_items (order_id, menu_id, item_name, quantity, price) VALUES ?',
            [orderValues]
        );

        // Clear cart
        await pool.query('DELETE FROM cart');

        res.json({ success: true, message: 'Order placed successfully', orderId });
    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;