const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// Diagnostic log to confirm when this route module is loaded
console.log('✅ [INIT] Orders Routes Loaded');

// @route DELETE /api/orders
// @desc Clear all order history for logged in user (SENSITIVE ACTION)
router.delete('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[ORDERS_API] Sensitive delete requested for user ${userId}`);

        // SQL will handle cascade to order_items
        const [result] = await pool.query(
            'DELETE FROM orders WHERE user_id = ?',
            [userId]
        );

        console.log(`[ORDERS_API] Successfully cleared ${result.affectedRows} order(s) for user ${userId}`);
        res.json({ success: true, message: `Your culinary journey history has been reset. Removed ${result.affectedRows} log entries.` });
    } catch (err) {
        console.error('CRITICAL ORDERS API ERR:', err);
        res.status(500).json({ success: false, message: 'Server error: Unable to clear culinary history.' });
    }
});

// @route GET /api/orders
// @desc Get order history for logged in user
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, total_amount, item_name, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows.map(o => ({ ...o, total_price: o.total_amount })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route GET /api/orders/:id
// @desc Get order details
router.get('/:id', protect, async (req, res) => {
    try {
        const [orderRows] = await pool.query(
            'SELECT * FROM orders WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (orderRows.length === 0) return res.status(404).json({ message: 'Order not found' });

        const [itemRows] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
        res.json({
            ...orderRows[0],
            total_price: orderRows[0].total_amount,
            items: itemRows.map(i => ({ ...i, name: i.item_name }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;