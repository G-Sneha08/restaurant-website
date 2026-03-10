const express = require("express");
const router = express.Router();

const pool = require("../config/db");

// import email function
const { sendBookingEmail } = require("../utils/sendEmail");


// ======================================
// CREATE TABLE BOOKING
// ======================================
router.post("/", async (req, res) => {

    const { name, email, phone, date, time, guests } = req.body;

    // validation
    if (!name || !email || !phone || !date || !time || !guests) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        // insert booking
        const [result] = await pool.query(
            `INSERT INTO bookings 
            (name, email, phone, date, time, guests) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [name, email, phone, date, time, guests]
        );

        const bookingId = result.insertId;

        // SEND EMAIL
        await sendBookingEmail(email, name, date, time, guests);

        res.status(201).json({
            message: "Booking successful",
            bookingId
        });

    } catch (error) {

        console.error("Booking Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ======================================
// GET ALL BOOKINGS (ADMIN)
// ======================================
router.get("/", async (req, res) => {

    try {

        const [bookings] = await pool.query(
            "SELECT * FROM bookings ORDER BY created_at DESC"
        );

        res.json(bookings);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ======================================
// GET BOOKING BY ID
// ======================================
router.get("/:id", async (req, res) => {

    const { id } = req.params;

    try {

        const [booking] = await pool.query(
            "SELECT * FROM bookings WHERE id = ?",
            [id]
        );

        if (booking.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json(booking[0]);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


module.exports = router;