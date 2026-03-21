const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menu WHERE available = TRUE');
        res.json({ success: true, menu: rows });
    } catch (err) {
        console.error("❌ [GET_MENU_ERROR]:", err.message);
        res.status(500).json({ success: false, message: 'Server error: Unable to load menu items.' });
    }
});

module.exports = router;
