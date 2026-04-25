// backend/src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com"],
      connectSrc: ["'self'", "https://crown-eve-center.onrender.com", "http://localhost:5000"]
    }
  }
}));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://crown-eve-center.vercel.app',
    'https://crown-eve-center-298d.vercel.app',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Rate Limiting (Auth routes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // relaxed for development
  message: { message: 'Too many requests, slow down.' }
});
app.use('/api/auth', authLimiter);

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const branchRoutes = require('./modules/branches/branch.routes');
const productRoutes = require('./modules/products/product.routes');
const userRoutes = require('./modules/users/user.routes');
const partRoutes = require('./modules/parts/part.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const orderRoutes = require('./modules/orders/order.routes');
const serviceRoutes = require('./modules/services/service.routes');
const appointmentRoutes = require('./modules/appointments/appointment.routes');
const supplierRoutes = require('./modules/suppliers/supplier.routes');
const purchaseRoutes = require('./modules/purchases/purchase.routes');
const reportRoutes = require('./modules/reports/report.routes');

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/reports', reportRoutes);

// Root route
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Crown Eve Management System API', 
    version: '1.0.0',
    status: 'Operational'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const logger = require('./config/logger');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error', { message: err.message, stack: err.stack });
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;
