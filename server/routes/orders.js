const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

// @route POST /api/orders/checkout
// @desc  Create order from cart
router.post('/checkout', protect, async (req, res) => {
    try {

        const userId = req.user.id;
        const { cartItems } = req.body;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        let total = 0;
        let itemNames = [];

        cartItems.forEach(item => {
            total += item.price * item.quantity;
            itemNames.push(item.name);
        });

        const namesString = itemNames.join(", ");

        // Insert order
        const [orderResult] = await pool.query(
            "INSERT INTO orders (user_id, total_amount, item_name) VALUES (?, ?, ?)",
            [userId, total, namesString]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (let item of cartItems) {
            await pool.query(
                "INSERT INTO order_items (order_id, menu_id, item_name, quantity, price) VALUES (?, ?, ?, ?, ?)",
                [
                    orderId,
                    item.menu_id || item.id,
                    item.name,
                    item.quantity,
                    item.price
                ]
            );
        }

        res.status(201).json({
            message: "🎉 Order placed successfully! Thank you for ordering."
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Checkout failed" });
    }
});

module.exports = router;