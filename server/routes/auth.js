const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");



// FIX 1️⃣ correct import
// ===============================
// AUTH ROUTES LOADED
// ===============================
console.log("🚀 Auth routes loaded successfully at /api/auth");
const { sendWelcomeEmail } = require("../utils/sendEmail");


// ===============================
// REGISTER ROUTE
// ===============================
router.post("/register", async (req, res) => {
    console.log("📥 [REGISTRATION] Request received:", req.body.email);
    const { name, email, password } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
        console.warn("⚠️ [REGISTRATION] Missing fields:", { name: !!name, email: !!email, hasPass: !!password });
        return res.status(400).json({ 
            success: false,
            message: "All fields (name, email, password) are mandatory." 
        });
    }

    try {
        // 2. Check existence
        const [existingUser] = await pool.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existingUser.length > 0) {
            console.warn(`⚠️ [REGISTRATION] Duplicate attempt: ${email}`);
            return res.status(409).json({ 
                success: false,
                message: "An account with this email already exists. Please login instead." 
            });
        }

        // 3. Hash and Insert
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        console.log(`✅ [REGISTRATION] User created: ${email} (ID: ${result.insertId})`);

        // 4. Send Email (Non-blocking but logged)
        // We trigger it here but don't strictly await it if it's very slow, 
        // though the user said "received immediately" so we'll do it promptly.
        sendWelcomeEmail(email, name).catch(err => {
            console.error("📧 [WELCOME_EMAIL_ERROR]:", err.message);
        });

        // 5. Success response
        return res.status(201).json({
            success: true,
            message: "Registration successful! Welcome to the family. Check your email for a welcome message.",
            userId: result.insertId
        });

    } catch (error) {
        console.error("❌ [REGISTRATION_CRITICAL_ERROR]:", error);
        
        // Handle race conditions (unique constraint hit at DB level)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false,
                message: "Email already registered." 
            });
        }

        return res.status(500).json({
            success: false,
            message: "An internal server error occurred. Please try again later."
        });
    }
});


// ===============================
// LOGIN ROUTE
// ===============================

// GET handler for testing and clarity
router.get("/login", (req, res) => {
    res.json({
        message: "Login endpoint is operational. Please use a POST request with 'email' and 'password' to authenticate.",
        method: "GET",
        instructions: "To log in, send a POST request to this same URL."
    });
});

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
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        console.error("Login Error:", error);

        res.status(500).json({
            message: "Server error"
        });

    }

});

module.exports = router;