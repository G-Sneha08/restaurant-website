const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// @route   GET /api/menu
// @desc    Get all menu items (with fail-safe fallback)
// Static fallback menu to serve when database is unavailable
const STATIC_FALLBACK_MENU = [
    { id: 101, name: 'Paneer Tikka', description: 'Grilled cottage cheese cubes marinated in Indian spices.', price: 199, image_url: 'images/panner-tikka.jpg', category: 'Starters' },
    { id: 102, name: 'Crispy Corn', description: 'Golden fried sweet corn tossed with spices.', price: 180, image_url: 'images/crispy-corn.jpg', category: 'Starters' },
    { id: 201, name: 'Paneer Butter Masala', description: 'Rich creamy tomato gravy with paneer cubes.', price: 250, image_url: 'images/panner-butter-masala.jpg', category: 'Main Course' },
    { id: 301, name: 'Cold Coffee', description: 'Chilled coffee blended with milk and ice cream.', price: 120, image_url: 'images/cold-coffee.jpg', category: 'Beverages' },
    { id: 401, name: 'Rasmalai', description: 'Cottage cheese balls soaked in saffron milk.', price: 150, image_url: 'images/rasmalai.jpg', category: 'Desserts' }
];

// @route   GET /api/menu
// @desc    Get all menu items (with fail-safe fallback)
router.get('/', async (req, res) => {
    try {
        // Use a 10s promise-based timeout for the query to ensure we don't hang local/Render processes
        const [rows] = await pool.query('SELECT * FROM menu WHERE available = TRUE');
        res.json({ success: true, menu: rows });
    } catch (err) {
        console.error("❌ [GET_MENU_ERROR]: Database connection failed. Serving fallback menu.", err.message);
        
        res.json({ 
            success: true, 
            menu: STATIC_FALLBACK_MENU, 
            note: "Currently in fallback mode due to database connectivity issues." 
        });
    }
});

module.exports = router;
