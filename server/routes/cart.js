const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// ============================
// GET /api/cart
// Get all cart items for the logged-in user
// ============================
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT cart.*, menu.name, menu.price, menu.image_url
             FROM cart
             JOIN menu ON cart.menu_id = menu.id
             WHERE cart.user_id = ?`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================
// POST /api/cart
// Add a new item to cart
// ============================
router.post('/', protect, async (req, res) => {
    const { menu_id, quantity } = req.body;

    if (!menu_id || quantity <= 0) {
        return res.status(400).json({ message: 'Invalid menu item or quantity' });
    }

    try {
        // Fetch item details from menu
        const [menuItem] = await pool.query('SELECT name, price FROM menu WHERE id = ?', [menu_id]);
        if (!menuItem.length) {
            return res.status(404).json({ message: 'Menu item not found' });
        }
        const { name, price } = menuItem[0];

        // Check if item already exists in cart
        const [existing] = await pool.query(
            'SELECT * FROM cart WHERE user_id = ? AND menu_id = ?',
            [req.user.id, menu_id]
        );

        if (existing.length > 0) {
            // Update quantity
            await pool.query(
                'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
                [quantity, existing[0].id]
            );
        } else {
            // Insert new item
            await pool.query(
                'INSERT INTO cart (user_id, menu_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)',
                [req.user.id, menu_id, name, quantity, price]
            );
        }

        res.status(201).json({ message: 'Item added to cart' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================
// PUT /api/cart/:id
// Update quantity of an existing cart item
// ============================
router.put('/:id', protect, async (req, res) => {
    const { quantity } = req.body;
    if (quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    try {
        const [result] = await pool.query(
            'UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?',
            [quantity, req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: 'Cart updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================
// DELETE /api/cart/:id
// Remove an item from cart
// ============================
router.delete('/:id', protect, async (req, res) => {
    try {
        const [result] = await pool.query(
            'DELETE FROM cart WHERE id = ? AND user_id = ?',
            [req.params.id, req.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Cart item not found' });
        }

        res.json({ message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;