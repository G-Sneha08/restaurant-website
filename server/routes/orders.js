const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/orders/checkout
// @desc  Create order from cart
router.post('/checkout', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get cart items
        const [cartItems] = await pool.query(
            `SELECT cart.*, menu.name, menu.price
             FROM cart
             JOIN menu ON cart.menu_id = menu.id
             WHERE cart.user_id = ?`,
            [userId]
        );

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Calculate total
        let total = 0;
        cartItems.forEach(item => {
            total += item.price * item.quantity;
        });

        // Insert order
        const [orderResult] = await pool.query(
            "INSERT INTO orders (user_id, total_amount) VALUES (?, ?)",
            [userId, total]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (let item of cartItems) {
            await pool.query(
                "INSERT INTO order_items (order_id, item_name, price, quantity) VALUES (?, ?, ?, ?)",
                [orderId, item.name, item.price, item.quantity]
            );
        }

        // Clear cart
        await pool.query(
            "DELETE FROM cart WHERE user_id = ?",
            [userId]
        );

        res.status(201).json({ message: "Order placed successfully!" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Checkout failed" });
    }
});

module.exports = router;