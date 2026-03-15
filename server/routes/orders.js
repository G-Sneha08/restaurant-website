const express = require("express");
const router = express.Router();
const pool = require("../config/db");


// ================= CHECKOUT =================
router.post("/checkout", async (req,res)=>{

  const { user_id } = req.body;

  try {

    const [cart] = await pool.query(`
      SELECT 
        c.menu_item_id,
        c.quantity,
        m.name,
        m.price
      FROM cart c
      JOIN menu m
      ON c.menu_item_id = m.id
      WHERE c.user_id = ?
    `,[user_id]);

    if(cart.length === 0){

      return res.status(400).json({
        success:false,
        message:"Cart is empty"
      });

    }

    let total = 0;

    cart.forEach(item=>{
      total += item.price * item.quantity;
    });

    const [order] = await pool.query(
      `INSERT INTO orders 
      (user_id,total_amount)
      VALUES (?,?)`,
      [user_id,total]
    );

    const orderId = order.insertId;

    for(const item of cart){

      await pool.query(`
        INSERT INTO order_items
        (order_id,menu_item_id,item_name,quantity,price)
        VALUES (?,?,?,?,?)
      `,[
        orderId,
        item.menu_item_id,
        item.name,
        item.quantity,
        item.price
      ]);

    }

    await pool.query(
      `DELETE FROM cart WHERE user_id=?`,
      [user_id]
    );

    res.json({
      success:true,
      orderId
    });

  } catch(err){

    console.error(err);

    res.status(500).json({
      success:false
    });

  }

});


module.exports = router;