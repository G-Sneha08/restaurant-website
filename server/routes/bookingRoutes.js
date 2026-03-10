const express = require("express");
const router = express.Router();
const db = require("../db");

/* ==============================
   CREATE BOOKING
============================== */

router.post("/", async (req, res) => {

    const { date, time, guests } = req.body;

    try {

        const result = await db.query(
            "INSERT INTO bookings (date, time, guests, status) VALUES (?, ?, ?, ?)",
            [date, time, guests, "Pending"]
        );

        res.json({
            message: "Booking created successfully"
        });

    } catch (err) {

        console.error(err);
        res.status(500).json({ error: "Server error" });

    }

});


/* ==============================
   GET ALL BOOKINGS (USER)
============================== */

router.get("/", async (req, res) => {

    try {

        const [rows] = await db.query(
            "SELECT * FROM bookings ORDER BY created_at DESC"
        );

        res.json(rows);

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});


/* ==============================
   ADMIN CONFIRM BOOKING
============================== */

router.put("/:id/confirm", async (req, res) => {

    const id = req.params.id;

    try {

        await db.query(
            "UPDATE bookings SET status='Confirmed' WHERE id=?",
            [id]
        );

        res.json({
            message: "Booking confirmed"
        });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});


/* ==============================
   ADMIN CANCEL BOOKING
============================== */

router.put("/:id/cancel", async (req, res) => {

    const id = req.params.id;

    try {

        await db.query(
            "UPDATE bookings SET status='Cancelled' WHERE id=?",
            [id]
        );

        res.json({
            message: "Booking cancelled"
        });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});


/* ==============================
   USER CANCEL BOOKING
============================== */

router.delete("/:id", async (req, res) => {

    const id = req.params.id;

    try {

        await db.query(
            "UPDATE bookings SET status='Cancelled' WHERE id=?",
            [id]
        );

        res.json({
            message: "Booking cancelled"
        });

    } catch (err) {

        res.status(500).json({ error: err.message });

    }

});

module.exports = router;