// server/routes/cart.js

const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // MySQL pool from /config/db.js

// ============================
// GET /api/cart/:user_id - fetch cart for a specific user
// ============================
router.get('/:user_id', async (req, res) => {
  const userId = req.params.user_id;

  try {
    const [rows] = await pool.query(
      `SELECT c.id, c.menu_id AS menu_item_id, c.quantity, c.item_name, c.price, c.created_at
       FROM cart c
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [userId]
    );

    const totalPrice = rows.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);

    res.json({ success: true, cart: rows, totalPrice });
  } catch (err) {
    console.error("Fetch cart error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================
// POST /api/cart - add item to cart for a specific user
// ============================
router.post('/', async (req, res) => {
  const { user_id, menu_id, quantity } = req.body;
  const qty = quantity || 1;

  if (!user_id || !menu_id) {
    return res.status(400).json({ success: false, message: 'user_id and menu_id are required' });
  }

  try {
    // Check if item exists for this user
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE user_id = ? AND menu_id = ?',
      [user_id, menu_id]
    );

    if (existing.length > 0) {
      await pool.query('UPDATE cart SET quantity = quantity + ? WHERE id = ?', [qty, existing[0].id]);
      return res.json({ success: true, message: 'Cart updated' });
    }

    // Fetch menu details
    const [menuItem] = await pool.query('SELECT name, price FROM menu WHERE id = ?', [menu_id]);
    if (menuItem.length === 0) return res.status(404).json({ success: false, message: 'Menu item not found' });

    await pool.query(
      'INSERT INTO cart (user_id, menu_id, quantity, item_name, price) VALUES (?, ?, ?, ?, ?)',
      [user_id, menu_id, qty, menuItem[0].name, menuItem[0].price]
    );

    return res.status(201).json({ success: true, message: 'Item added to cart' });
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================
// PUT /api/cart/:id - update quantity
// ============================
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });

  try {
    const [result] = await pool.query('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });

    res.json({ success: true, message: 'Quantity updated' });
  } catch (err) {
    console.error("Update cart quantity error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================
// DELETE /api/cart/:id - delete cart item
// ============================
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM cart WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Cart item not found' });

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    console.error("Delete cart item error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================
// DELETE /api/cart - clear all cart items for a user
// ============================
router.delete('/', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ success: false, message: 'user_id is required' });

  try {
    await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ============================
// POST /api/cart/checkout - place order for a user
// ============================
router.post('/checkout', async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ success: false, message: 'user_id is required' });

  try {
    const [cartItems] = await pool.query('SELECT * FROM cart WHERE user_id = ?', [user_id]);
    if (cartItems.length === 0) return res.status(400).json({ success: false, message: 'Cart is empty' });

    const totalAmount = cartItems.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const itemNames = cartItems.map(item => item.item_name).join(', ');

    const [orderResult] = await pool.query(
      'INSERT INTO orders (user_id, item_name, total_amount) VALUES (?, ?, ?)',
      [user_id, itemNames, totalAmount]
    );
    const orderId = orderResult.insertId;

    const orderValues = cartItems.map(item => [
      orderId,
      item.menu_id,
      item.item_name,
      item.quantity,
      item.price
    ]);

    await pool.query('INSERT INTO order_items (order_id, menu_id, item_name, quantity, price) VALUES ?', [orderValues]);

    // Clear cart
    await pool.query('DELETE FROM cart WHERE user_id = ?', [user_id]);

    res.json({ success: true, message: 'Order placed successfully', orderId });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;