const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const sendEmail = require("../utils/emailService");
// @route   POST /api/auth/register
// @desc    Register a user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Insert user
        await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        // 🔥 Send email to THAT user
        await sendEmail(
            email,   // ← dynamic
            "Welcome to Lumina Dine 🎉",
            `Hello ${name},

Your account has been successfully created.

Thank you for registering!

- Lumina Dine`
        );

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "User not found" });
        }

        const user = rows[0];

        // check password here...

        // 🔥 Send login alert email
        await sendEmail(
            user.email,   // ← dynamic from DB
            "Login Successful 🔐",
            `Hello ${user.name},

You have successfully logged in.

If this was not you, please reset your password immediately.

- Lumina Dine`
        );

        res.json({ message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
