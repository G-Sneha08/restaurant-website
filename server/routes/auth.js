const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");



// FIX 1️⃣ correct import
const { sendWelcomeEmail } = require("../utils/sendEmail");


// ===============================
// REGISTER ROUTE
// ===============================
router.post("/register", async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {

        // check if user exists
        const [existingUser] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // insert user
        await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        // FIX 2️⃣ send email BEFORE response
        await sendWelcomeEmail(email, name);

        res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {

        console.error("Register Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});


// ===============================
// LOGIN ROUTE
// ===============================
router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    try {

        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});

module.exports = router;