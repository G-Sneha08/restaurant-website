const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const sendEmail = require("../utils/emailService");
// @route   POST /api/auth/register
// @desc    Register a user
<<<<<<< HEAD
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
=======
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            [name, email, hashedPassword]
        );

        const token = jwt.sign(
            { id: result.insertId, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            token,
            user: { id: result.insertId, name, email, role: 'user' }
        });
        await sendEmail(
    email,
    "Welcome to Lumina Dine 🎉",
    `Hello ${name},\n\nYour account has been successfully created!\n\nThank you for registering with Lumina Dine.`
);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
>>>>>>> 5cc34f09652c928b31cdd89313c065a5f7fd6b40
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
<<<<<<< HEAD
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
=======
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            res.json({
                token,
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
        await sendEmail(
    user.email,
    "Login Alert - Lumina Dine",
    `Hello ${user.name},\n\nYou have successfully logged into your account.\n\nIf this wasn't you, please reset your password immediately.`
);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
>>>>>>> 5cc34f09652c928b31cdd89313c065a5f7fd6b40
    }
});

module.exports = router;
