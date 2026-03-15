const express = require("express");
const router = express.Router();
const pool = require("../config/db");


// ================= CLEAR CART =================
// placed FIRST to avoid route conflict
router.delete("/clear/:user_id", async (req,res)=>{

  const userId = req.params.user_id;

  try {

    await pool.query(
      `DELETE FROM cart WHERE user_id=?`,
      [userId]
    );

    res.json({
      success:true,
      message:"Cart cleared"
    });

  } catch (err) {

    console.error("Clear cart error:", err);

    res.status(500).json({
      success:false
    });

  }

});


// ================= GET CART =================
router.get("/:user_id", async (req, res) => {

  try {

    const userId = req.params.user_id;

    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.menu_item_id,
        c.quantity,
        m.name,
        m.price,
        m.image_url
      FROM cart c
      JOIN menu m
      ON c.menu_item_id = m.id
      WHERE c.user_id = ?
      ORDER BY c.id DESC
    `, [userId]);

    const totalPrice = rows.reduce(
      (sum,item)=> sum + item.price * item.quantity,
      0
    );

    res.json({
      success:true,
      cart:rows,
      totalPrice
    });

  } catch (err) {

    console.error("Fetch cart error:", err);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

});


// ================= ADD TO CART =================
router.post("/", async (req, res) => {

  const { user_id, menu_item_id, quantity } = req.body;

  if (!user_id || !menu_item_id) {

    return res.status(400).json({
      success:false,
      message:"user_id and menu_item_id required"
    });

  }

  const qty = quantity || 1;

  try {

    const [existing] = await pool.query(
      `SELECT * FROM cart 
       WHERE user_id=? AND menu_item_id=?`,
      [user_id, menu_item_id]
    );

    if (existing.length > 0) {

      await pool.query(
        `UPDATE cart 
         SET quantity = quantity + ? 
         WHERE id=?`,
        [qty, existing[0].id]
      );

    } else {

      await pool.query(
        `INSERT INTO cart
         (user_id, menu_item_id, quantity)
         VALUES (?,?,?)`,
        [user_id, menu_item_id, qty]
      );

    }

    res.json({
      success:true,
      message:"Item added to cart"
    });

  } catch (err) {

    console.error("Add cart error:", err);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

});


// ================= UPDATE QUANTITY =================
router.put("/:id", async (req,res)=>{

  const { quantity } = req.body;

  try {

    await pool.query(
      `UPDATE cart 
       SET quantity=? 
       WHERE id=?`,
      [quantity, req.params.id]
    );

    res.json({
      success:true,
      message:"Cart updated"
    });

  } catch (err) {

    console.error("Update cart error:", err);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

});


// ================= DELETE CART ITEM =================
router.delete("/:id", async (req,res)=>{

  try {

    await pool.query(
      `DELETE FROM cart WHERE id=?`,
      [req.params.id]
    );

    res.json({
      success:true,
      message:"Item removed"
    });

  } catch (err) {

    console.error("Delete cart error:", err);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }

});


module.exports = router;
