const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/cart
// @desc    Get user cart items
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT cart.*, menu.name, menu.price, menu.image_url 
             FROM cart JOIN menu ON cart.menu_id = menu.id 
             WHERE user_id = ?`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/cart
// @desc    Add item to cart
router.post('/', protect, async (req, res) => {
    const { menu_id, quantity } = req.body;
    try {
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND menu_id = ?',
            [req.user.id, menu_id]
        );

        if (existing.length > 0) {
            await pool.query(
                'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
                [quantity || 1, existing[0].id] 
            );
        } else {
            await pool.query(
                'INSERT INTO cart (user_id, menu_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, menu_id, req.body.item_name, quantity || 1, req.body.price]
            );
        }
        res.status(201).json({ message: 'Item added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/cart/:id
// @desc    Update quantity
router.put('/:id', protect, async (req, res) => {
    const { quantity } = req.body;
    try {
        await pool.query('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?', [
            quantity,
            req.params.id,
            req.user.id
        ]);
        res.json({ message: 'Cart updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
router.delete('/:id', protect, async (req, res) => {
    try {
        await pool.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [
            req.params.id,
            req.user.id
        ]);
        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
