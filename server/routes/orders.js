const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/orders
// @desc    Place an order
router.post('/', protect, async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [cartItems] = await connection.query(
            `SELECT cart.*, menu.price FROM cart 
             JOIN menu ON cart.menu_id = menu.id 
             WHERE user_id = ?`,
            [req.user.id]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const total_amount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount) VALUES (?, ?)',
            [req.user.id, total_amount]
        );

        const orderId = orderResult.insertId;

        for (const item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.menu_id, item.quantity, item.price]
            );
        }

        await connection.query('DELETE FROM cart WHERE user_id = ?', [req.user.id]);

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
});

// @route   GET /api/orders
// @desc    Get user orders
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/orders/:id
// @desc    Get order details
router.get('/:id', protect, async (req, res) => {
    try {
        const [order] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (order.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const [items] = await pool.query(
            `SELECT order_items.*, menu.name 
             FROM order_items JOIN menu ON order_items.menu_id = menu.id 
             WHERE order_id = ?`,
            [req.params.id]
        );

        res.json({ ...order[0], items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
