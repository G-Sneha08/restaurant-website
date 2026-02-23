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

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
// ================= PEXELS IMAGE ROUTE =================
const axios = require('axios');

app.get('/api/image', async (req, res) => {
    try {
        const query = req.query.query;

        const response = await axios.get(
            `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
            {
                headers: {
                    Authorization: process.env.PEXELS_API_KEY
                }
            }
        );

        if (response.data.photos.length > 0) {
            res.json({
                image: response.data.photos[0].src.large
            });
        } else {
            res.json({ image: null });
        }

    } catch (error) {
        console.error("Pexels API Error:", error.message);
        res.status(500).json({ error: "Failed to fetch image" });
    }
});