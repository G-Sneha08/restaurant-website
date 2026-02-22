const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/menu
// @desc    Get all menu items
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM menu WHERE available = TRUE');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
