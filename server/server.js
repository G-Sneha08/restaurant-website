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
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith(".vercel.app") || 
                     process.env.NODE_ENV !== 'production';
                     
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`⚠️ [CORS_REJECTED]: ${origin}. Origin not in allowed list.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===================== Frontend Serving =====================
const clientPath = path.join(__dirname, '../client');
app.use(express.static(clientPath));

// Health check with DB status
app.get('/health', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      message: 'Restaurant API and Database are operational' 
    });
  } catch (err) {
    res.status(503).json({ 
      status: 'error', 
      database: 'disconnected', 
      message: 'API is running but Database connection failed',
      error: err.message
    });
  }
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
    "Chicken Biryani": "https://images.pexels.com/photos/4439740/pexels-photo-4439740.jpeg",
    "Margherita Pizza": "https://images.pexels.com/photos/2147491/pexels-photo-2147491.jpeg",
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
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  }).on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`❌ Port ${PORT} already in use. Try a different PORT in .env`);
      process.exit(1);
    } else {
      console.error("🌋 [SERVER_START_ERROR]:", err);
    }
  });
}

// Export app for serverless platforms (Vercel, etc.)
module.exports = app;