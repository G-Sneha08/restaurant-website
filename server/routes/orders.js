const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { protect } = require('../middleware/authMiddleware');

// @route GET /api/orders
// @desc Get order history for logged in user
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, total_amount, item_name, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        
        // Map total_amount to total_price for frontend compatibility
        const orders = rows.map(o => ({
            ...o,
            total_price: o.total_amount 
        }));
        
        res.json(orders);
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

        if (orderRows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const [itemRows] = await pool.query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [req.params.id]
        );

        res.json({
            ...orderRows[0],
            total_price: orderRows[0].total_amount,
            items: itemRows.map(i => ({
                ...i,
                name: i.item_name // For frontend compatibility
            }))
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route DELETE /api/orders/clear
// @desc Clear all order history for logged in user
router.delete('/clear', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[ORDERS] Request to clear history for user ${userId}`);

        const [result] = await pool.query(
            'DELETE FROM orders WHERE user_id = ?',
            [userId]
        );

        res.json({ success: true, message: `Successfully cleared ${result.affectedRows} order(s).` });
    } catch (err) {
        console.error('Clear Orders API error:', err);
        res.status(500).json({ success: false, message: 'Server error while clearing orders' });
    }
});

module.exports = router;