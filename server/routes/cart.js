// server/routes/cart.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ============================
// GET /api/cart - fetch all cart items for a user
// ============================
router.get('/:user_id', async (req, res) => {
    const userId = req.params.user_id;
    try {
        const [rows] = await pool.query(
            `SELECT c.id, c.menu_id, c.quantity, m.name AS item_name, m.price
             FROM cart c
             JOIN menu m ON c.menu_id = m.id
             WHERE c.user_id = ?`, [userId]
        );
        const totalPrice = rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
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
    const { user_id, menu_id, quantity } = req.body;
    if (!user_id || !menu_id) return res.status(400).json({ success: false, message: 'user_id and menu_id required' });

    try {
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND menu_id = ?',
            [user_id, menu_id]
        );

        if (existing.length > 0) {
            await pool.query(
                'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
                [quantity || 1, existing[0].id]
            );
            return res.json({ success: true, message: 'Cart updated' });
        } else {
            await pool.query(
                'INSERT INTO cart (user_id, menu_id, quantity) VALUES (?, ?, ?)',
                [user_id, menu_id, quantity || 1]
            );
            return res.json({ success: true, message: 'Item added to cart' });
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
        const [result] = await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
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
// DELETE /api/cart - clear all cart items for a user
// ============================
router.delete('/', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.status(400).json({ success: false, message: 'user_id required' });

    try {
        await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;