const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");

/* ==============================
   CREATE BOOKING
============================== */
router.post("/", protect, async (req, res) => {
    const { date, time, guests } = req.body;
    const userId = req.user.id;

    if (!date || !time || !guests) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [result] = await pool.query(
            "INSERT INTO bookings (user_id, date, time, guests, status) VALUES (?, ?, ?, ?, ?)",
            [userId, date, time, guests, "Pending"]
        );

        res.status(201).json({
            message: "Booking created successfully",
            bookingId: result.insertId
        });

    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ==============================
   GET ALL BOOKINGS (USER)
============================== */
router.get("/", protect, async (req, res) => {
    const userId = req.user.id;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );
        res.json(rows);

    } catch (err) {
        console.error("Get bookings error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

/* ==============================
   CANCEL BOOKING (USER)
============================== */
router.delete("/:id", protect, async (req, res) => {
    const id = req.params.id;
    const userId = req.user.id;

    try {
        await pool.query(
            "UPDATE bookings SET status='Cancelled' WHERE id = ? AND user_id = ?",
            [id, userId]
        );
        res.json({ message: "Booking cancelled" });

    } catch (err) {
        console.error("Cancel booking error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;