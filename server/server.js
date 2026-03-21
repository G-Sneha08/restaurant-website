// server/server.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Import routes
const authRoutes = require('./routes/auth');
const menuRoutes = require('./routes/menu');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const bookingRoutes = require('./routes/booking');
const feedbackRoutes = require('./routes/feedback');
const adminRoutes = require('./routes/admin');

// DB connection
const pool = require('./config/db');

const app = express();

// ===================== Middleware =====================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================== CORS =====================
const allowedOrigins = [
  "https://restaurant-website-umber-three.vercel.app",
  "https://restaurant-website-489aafoff-g-sneha08s-projects.vercel.app",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins
    : true, // Allow all in dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===================== Frontend Serving =====================
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Restaurant API is running' });
});

// ===================== API Routes =====================
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

// Image API (optional fallback)
app.get('/api/images', (req, res) => {
  const imageMap = {
    "Paneer Tikka": "/images/panner-tikka.jpg",
    "Paneer Butter Masala": "/images/panner-butter-masala.jpg",
    "Cold Coffee": "/images/cold-coffee.jpg",
    "Crispy Corn": "/images/crispy-corn.jpg",
    "Rasmalai": "/images/rasmalai.jpg"
  };
  res.json({ success: true, images: imageMap });
});

// Root route - serve index.html (SPA Fallback)
app.get('*', (req, res) => {
  // If request is for an API route that wasn't matched above, return 404 instead of index.html
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
        message: 'API route not found',
        success: false,
        path: req.originalUrl
    });
  }
  const indexPath = path.join(clientPath, 'index.html');
  res.sendFile(indexPath);
});

// ===================== Error handling middleware =====================
app.use((err, req, res, next) => {
  console.error("🌋 [CRITICAL_SERVER_CRASH]:", err.stack);
  res.status(500).json({ 
      success: false, 
      message: 'Critical system error: Our culinary engine encountered an unexpected hurdle. We have logged this and are on it.',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ===================== Start server =====================
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export app for serverless platforms (Vercel, etc.)
module.exports = app;