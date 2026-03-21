const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { protect } = require("../middleware/authMiddleware");
const { sendBookingEmail } = require("../utils/sendEmail");

/* ==============================
   CREATE BOOKING
============================== */
router.post("/", protect, async (req, res) => {
    let { name, email, phone, date, time, guests } = req.body;
    const userId = req.user.id;

    if (!date || !time || !guests) {
        return res.status(400).json({ success: false, message: "Date, time, and guests are required" });
    }

    try {
        // If email/name not provided, fetch from user record
        if (!email || !name) {
            const [users] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
            if (users.length > 0) {
                name = name || users[0].name;
                email = email || users[0].email;
            }
        }

        const [result] = await pool.query(
            "INSERT INTO bookings (user_id, customer_name, customer_email, customer_phone, date, time, guests, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [userId, name || null, email || null, phone || null, date, time, guests, "Pending"]
        );

        // Send Email (Awaited for reliability)
        if (email) {
            try {
                await sendBookingEmail(email, name || 'Valued Guest', date, time, guests);
            } catch (err) {
                console.error("Booking Email Failed:", err.message);
            }
        }

        res.status(201).json({
            success: true,
            message: "Table booked successfully",
            bookingId: result.insertId
        });

    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({ success: false, message: "Server error" });
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
        res.json({
            success: true,
            bookings: rows
        });

    } catch (err) {
        console.error("Get bookings error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/* ==============================
   DELETE ALL BOOKINGS (USER)
============================== */
router.delete("/", protect, async (req, res) => {
    const userId = req.user.id;

    try {
        console.log(`📥 [DELETE_ALL_BOOKINGS] Attempting clear for user ${userId}`);
        const [result] = await pool.query(
            "DELETE FROM bookings WHERE user_id = ?",
            [userId]
        );
        console.log(`✅ [DELETE_ALL_BOOKINGS] Successfully purged ${result.affectedRows} record(s) for user ${userId}`);
        res.json({ success: true, message: `Your culinary history has been cleared. Purged ${result.affectedRows} reservation(s).` });

    } catch (err) {
        console.error("CRITICAL DELETE_ALL_BOOKINGS ERR:", err);
        res.status(500).json({ success: false, message: "Server encountered a database error during purge." });
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
        res.json({ success: true, message: "Booking cancelled" });

    } catch (err) {
        console.error("Cancel booking error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;