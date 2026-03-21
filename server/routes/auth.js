const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");



// FIX 1️⃣ correct import
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

// ===============================
// REGISTER ROUTE
// ===============================
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ 
            success: false,
            message: "All fields (name, email, password) are mandatory." 
        });
    }

    try {
        const [existingUser] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ 
                success: false,
                message: "An account with this email already exists." 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword]
        );

        console.log(`✅ [REGISTRATION] User created: ${email} (ID: ${result.insertId})`);

        // 5. Success response
        return res.status(201).json({
            success: true,
            message: "Registration successful! Welcome to the family.",
            userId: result.insertId
        });

    } catch (error) {
        console.error("❌ [REGISTRATION_ERROR]:", error.message);
        
        // Handle race conditions (unique constraint hit at DB level)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ 
                success: false,
                message: "Email already registered." 
            });
        }

        return res.status(500).json({
            success: false,
            message: "Registration failed due to a server-side error. Please verify your connection.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


// ===============================
// LOGIN ROUTE
// ===============================

// GET handler for testing and clarity
router.get("/login", (req, res) => {
    res.json({
        success: true,
        message: "Login endpoint is operational. Please use a POST request with 'email' and 'password' to authenticate.",
        method: "GET",
        instructions: "To log in, send a POST request to this same URL."
    });
});

router.post("/login", async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and password are required"
        });
    }

    try {

        const [users] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: Invalid credentials"
            });
        }

        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed: Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({
            success: true,
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

        console.error("❌ [LOGIN_ERROR]:", error.message);

        res.status(500).json({
            success: false,
            message: "Login failed due to a server error. Please try again later.",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });

    }

});

module.exports = router;