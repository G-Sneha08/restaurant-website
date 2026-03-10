const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/booking');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

const app = express();

// ===================== Middleware =====================
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for local/dev
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client')));

// ===================== Routes =====================
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Restaurant API is running...');
});

// ===================== Image API =====================
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

// ===================== Error handling middleware =====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// ===================== Start server =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});