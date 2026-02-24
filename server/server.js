const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/booking');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // For local development flexibility
}));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('client'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
    res.send('Restaurant API is running...');
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT,'0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// ================= IMPROVED PEXELS IMAGE ROUTE =================
//const axios = require('axios');
// ================== MENU IMAGE API ==================
app.get('/api/images', (req, res) => {
    try {

          const imageMap = {
        "Paneer Tikka": "/images/panner-tikka.jpg",
        "Paneer Butter Masala": "/images/paneer-butter-masala.jpg",
        "Cold Coffee": "/images/cold-coffee.jpg",
        "Crispy Corn": "/images/crispy-corn.jpg",
        "Rasmalai": "/images/rasmalai.jpg"
    };

    res.json({
        success: true,
        images: imageMap
    });


    } catch (error) {
        console.error("Image API Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch images"
        });
    }
});