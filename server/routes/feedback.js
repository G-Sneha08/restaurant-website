const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/feedback
// @desc    Submit feedback
router.post('/', protect, async (req, res) => {
    const { message, rating } = req.body;
    try {
        await pool.query(
            'INSERT INTO feedback (user_id, message, rating) VALUES (?, ?, ?)',
            [req.user.id, message, rating]
        );
        res.status(201).json({ message: 'Feedback submitted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/feedback
// @desc    Get all feedback (Publicly visible?) - Usually yes for testimonials
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT feedback.*, users.name FROM feedback 
             JOIN users ON feedback.user_id = users.id 
             ORDER BY created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
