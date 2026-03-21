const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const jwt = require('jsonwebtoken');
const { sendOrderEmail } = require('../utils/sendEmail');

// Helper to get userId from token or return null
const getUserId = (req) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            return decoded.id;
        } catch (e) {
            return null;
        }
    }
    return null;
};

// ================= GET CART =================
router.get('/', async (req, res) => {
    try {
        const userId = getUserId(req);
        
        let query = 'SELECT * FROM cart';
        let params = [];
        
        if (userId) {
            query += ' WHERE user_id = ?';
            params.push(userId);
        } else {
            query += ' WHERE user_id IS NULL';
        }
        
        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);

        const totalPrice = rows.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
        res.json({ success: true, cart: rows, totalPrice });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================= ADD TO CART =================
router.post('/', async (req, res) => {
    const { menu_item_id, quantity } = req.body;
    const qty = quantity || 1;

    if (!menu_item_id) {
        return res.status(400).json({ success: false, message: 'Invalid menu_item_id' });
    }

    try {
        const userId = getUserId(req);

        // Check if item exists in cart for this user/guest
        let existingQuery = 'SELECT * FROM cart WHERE menu_item_id = ?';
        let existingParams = [menu_item_id];
        if (userId) {
            existingQuery += ' AND user_id = ?';
            existingParams.push(userId);
        } else {
            existingQuery += ' AND user_id IS NULL';
        }

        const [existing] = await pool.query(existingQuery, existingParams);

        if (existing.length > 0) {
            await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [qty, existing[0].id]);
            res.status(200).json({ success: true, message: 'Cart updated' });
        } else {
            // Get item details from menu
            const [menuItems] = await pool.query('SELECT name, price FROM menu WHERE id = ?', [menu_item_id]);
            if (menuItems.length === 0) {
                return res.status(404).json({ success: false, message: 'Menu item not found' });
            }

            await pool.query(
                `INSERT INTO cart (user_id, menu_item_id, item_name, price, quantity) VALUES (?, ?, ?, ?, ?)`,
                [userId, menu_item_id, menuItems[0].name, menuItems[0].price, qty]
            );
            res.status(201).json({ success: true, message: 'Item added to cart' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================= UPDATE QUANTITY =================
router.put('/:id', async (req, res) => {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

    try {
        const [result] = await pool.query(
            'UPDATE cart SET quantity = ? WHERE id = ?',
            [quantity, req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });
        res.json({ success: true, message: 'Quantity updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================= DELETE ITEM =================
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });
        res.json({ success: true, message: 'Item removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================= CLEAR CART =================
router.delete('/', async (req, res) => {
    try {
        const userId = getUserId(req);

        if (userId) {
            await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);
        } else {
            await pool.query('DELETE FROM cart WHERE user_id IS NULL');
        }
        res.json({ success: true, message: 'Cart cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ================= CHECKOUT =================
router.post('/checkout', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log(`[CHECKOUT] Starting checkout for user ${userId}`);

        // Claim any guest items associated with this user session (optional but helpful)
        await pool.query('UPDATE cart SET user_id = ? WHERE user_id IS NULL', [userId]);

        // Get final cart items
        const [finalItems] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [userId]);
        
        if (finalItems.length === 0) {
            console.log(`[CHECKOUT] Cart is empty for user ${userId}`);
            return res.status(400).json({ success: false, message: 'Your cart is empty' });
        }

        const totalPrice = finalItems.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0);
        const itemNames = finalItems.map(i => i.item_name).join(', ');

        // Create main order record
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_amount, item_name, status) VALUES (?, ?, ?, ?)', 
            [userId, totalPrice, itemNames, 'Pending']
        );
        const orderId = orderResult.insertId;

        // Create specific order items
        // NOTE: Column names must match 'order_items' table schema (menu_item_id, item_name, quantity, price)
        const orderValues = finalItems.map(item => [
            orderId, 
            item.menu_item_id, 
            item.item_name, 
            item.quantity, 
            item.price
        ]);

        // Batch insert for performance
        await pool.query(
            'INSERT INTO order_items (order_id, menu_item_id, item_name, quantity, price) VALUES ?', 
            [orderValues]
        );

        // Clear the cart
        await pool.query('DELETE FROM cart WHERE user_id = ?', [userId]);

        console.log(`[CHECKOUT] Success: Order ${orderId} placed for user ${userId}`);

        // Send Order Email (Non-blocking for immediate UI feedback)
        const [users] = await pool.query("SELECT name, email FROM users WHERE id = ?", [userId]);
        if (users.length > 0) {
            sendOrderEmail(users[0].email, users[0].name, orderId, totalPrice).catch(err => {
                console.error("📧 [ORDER_EMAIL_ERROR]:", err.message);
            });
        }

        return res.json({ 
            success: true, 
            message: 'Your exquisite order has been placed successfully! Check your email for details.', 
            orderId 
        });

    } catch (err) {
        console.error('CRITICAL CHECKOUT ERROR:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Server error during checkout',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined 
        });
    }
});

module.exports = router;