const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');

// @route   POST /api/admin/login
// @desc    Admin login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Example admin credentials (temporary)
    if (email === 'admin@restaurant.com' && password === 'password123') {
        const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return res.json({ success: true, token, message: 'Login successful' });
    }
    
    res.status(401).json({ success: false, message: 'Invalid admin credentials' });
});

// All subsequent routes here should be protected and admin-only
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

// @route   GET /api/admin/stats
// @desc    Get dashboard statistics
router.get('/stats', async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT COUNT(*) as totalOrders, SUM(total_amount) as totalRevenue FROM orders');
        const [bookings] = await pool.query('SELECT COUNT(*) as totalBookings FROM bookings');
        const [users] = await pool.query('SELECT COUNT(*) as totalUsers FROM users');
        const [pendingOrders] = await pool.query("SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'");

        res.json({
            success: true,
            totalOrders: orders[0].totalOrders || 0,
            totalBookings: bookings[0].totalBookings || 0,
            totalRevenue: orders[0].totalRevenue || 0,
            totalUsers: users[0].totalUsers || 0,
            pendingOrders: pendingOrders[0].count || 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/orders
// @desc    Get all orders
router.get('/orders', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT orders.*, users.name as user_name FROM orders 
             JOIN users ON orders.user_id = users.id 
             ORDER BY created_at DESC`
        );
        res.json({ success: true, orders: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/orders/:id/status
// @desc    Update order status
router.put('/orders/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Order status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/bookings
// @desc    Get all bookings
router.get('/bookings', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT bookings.*, users.name as user_account_name FROM bookings 
             JOIN users ON bookings.user_id = users.id 
             ORDER BY date DESC, time DESC`
        );
        res.json({ success: true, bookings: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/bookings/:id/status
// @desc    Update booking status
router.put('/bookings/:id/status', async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ success: true, message: 'Booking status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/menu
// @desc    Get all menu items (including unavailable ones)
router.get('/menu', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menu ORDER BY category, name');
        res.json({ success: true, menu: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
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
        res.status(201).json({ success: true, message: 'Menu item added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/menu/:id
// @desc    Update menu item
router.put('/menu/:id', async (req, res) => {
    const { name, description, price, image_url, category, available } = req.body;
    try {
        await pool.query(
            'UPDATE menu SET name = ?, description = ?, price = ?, image_url = ?, category = ?, available = ? WHERE id = ?',
            [name, description, price, image_url, category, available === undefined ? true : available, req.params.id]
        );
        res.json({ success: true, message: 'Menu item updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/menu/:id
// @desc    Delete menu item
router.delete('/menu/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM menu WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Menu item deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role/status
router.put('/users/:id/role', async (req, res) => {
    const { role } = req.body;
    try {
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ success: true, message: 'User updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   GET /api/admin/reviews
// @desc    Get all feedback
router.get('/reviews', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT feedback.*, users.name as user_name FROM feedback JOIN users ON feedback.user_id = users.id ORDER BY created_at DESC'
        );
        res.json({ success: true, reviews: rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// @route   DELETE /api/admin/reviews/:id
// @desc    Delete feedback
router.delete('/reviews/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM feedback WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Review deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
