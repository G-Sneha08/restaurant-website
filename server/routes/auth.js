const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
const sendEmail = require("../utils/emailService");

// @route   POST /api/auth/register
// @desc    Register a user
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        const [existingUser] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        // Generate JWT
        const token = jwt.sign(
            { id: result.insertId, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // Send welcome email
        await sendEmail(
            email,
            "Welcome to Lumina Dine 🎉",
            `Hello ${name},

Your account has been successfully created.

Thank you for registering with Lumina Dine!

- Lumina Dine`
        );

        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                name,
                email,
                role: "user",
            },
        });

    } catch (err) {
        console.error(err);
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

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role || "user" },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        // Send login alert email
        await sendEmail(
            user.email,
            "Login Alert - Lumina Dine 🔐",
            `Hello ${user.name},

You have successfully logged into your account.

If this wasn't you, please reset your password immediately.

- Lumina Dine`
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || "user",
            },
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;