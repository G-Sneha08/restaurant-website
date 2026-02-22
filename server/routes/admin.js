const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes here should be protected and admin-only
router.use(protect, admin);

// @route   GET /api/admin/users
// @desc    Get all users
router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders with optional pagination
router.get('/orders', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        const [rows] = await pool.query(
            `SELECT orders.*, users.name as user_name FROM orders 
             JOIN users ON orders.user_id = users.id 
             ORDER BY created_at DESC LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id
// @desc    Update order status
router.put('/orders/:id', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/menu
// @desc    Add menu item
router.post('/menu', async (req, res) => {
    const { name, description, price, image_url, category } = req.body;
    try {
        await pool.query(
            'INSERT INTO menu (name, description, price, image_url, category) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, image_url, category]
        );
        res.status(201).json({ message: 'Menu item added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/admin/menu/:id
// @desc    Update menu item
router.put('/menu/:id', async (req, res) => {
    const { name, description, price, image_url, category, available } = req.body;
    try {
        await pool.query(
            'UPDATE menu SET name = ?, description = ?, price = ?, image_url = ?, category = ?, available = ? WHERE id = ?',
            [name, description, price, image_url, category, available, req.params.id]
        );
        res.json({ message: 'Menu item updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/admin/menu/:id
// @desc    Delete menu item
router.delete('/menu/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM menu WHERE id = ?', [req.params.id]);
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
