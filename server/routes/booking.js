const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');


// ================= GET USER BOOKINGS =================
router.get('/', protect, async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM bookings WHERE user_id = ? ORDER BY date DESC, time DESC',
            [req.user.id]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// ================= CREATE BOOKING =================
router.post('/', protect, async (req, res) => {
    const { date, time, guests } = req.body;

    try {
        await pool.query(
            'INSERT INTO bookings (user_id, date, time, guests) VALUES (?, ?, ?, ?)',
            [req.user.id, date, time, guests]
        );

        res.status(201).json({ message: 'Table booked successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;