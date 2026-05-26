// backend/src/app.js - updated for Hostinger environment loading
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { cacheGet } = require('./middleware/cache');

const app = express();

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
const corsOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://crown-eve-center.vercel.app',
  'https://crown-eve-center-298d.vercel.app',
  'https://crownevcenter.com',
  'https://www.crownevcenter.com',
  process.env.FRONTEND_URL,
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;
  if (/^https:\/\/([\w-]+\.)?crownevcenter\.com$/.test(origin)) return true;
  if (/^http:\/\/localhost:\d+$/.test(origin)) return true;
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) callback(null, origin || true);
      else callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Cache-Control'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
  })
);
app.use(compression());
app.use(express.json({ limit: '2mb' }));
// NOTE: /uploads static removed — files served from Cloudflare R2

// Public/read-heavy GET caching (short TTL; skips auth/orders/accounts)
app.use('/api', cacheGet(45));

// Routes
const authRoutes = require('./modules/auth/auth.routes');
const branchRoutes = require('./modules/branches/branch.routes');
const productRoutes = require('./modules/products/product.routes');
const userRoutes = require('./modules/users/user.routes');
const partRoutes = require('./modules/parts/part.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const orderRoutes = require('./modules/orders/order.routes');
const serviceRoutes = require('./modules/services/service.routes');
const bookingRoutes = require('./modules/service-bookings/booking.routes');
const supplierRoutes = require('./modules/suppliers/supplier.routes');
const purchaseRoutes = require('./modules/purchases/purchase.routes');
const reportRoutes = require('./modules/reports/report.routes');
const categoryRoutes = require('./modules/categories/category.routes');
const brandRoutes = require('./modules/brands/brand.routes');
const uploadRoutes = require('./modules/uploads/upload.routes');
const serviceCategoryRoutes = require('./modules/service-categories/service-category.routes');
const testimonialRoutes = require('./modules/testimonials/testimonials.routes');
const walkInRoutes = require('./modules/walk-in-customers/walk-in.routes');
const bankInfoRoutes = require('./modules/banks/bank.routes');
const accountRoutes = require('./modules/accounts/account.routes');
const voucherRoutes = require('./modules/vouchers/voucher.routes');

app.use('/api/auth', authRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/appointments', bookingRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/walk-in-customers', walkInRoutes);
app.use('/api/banks', bankInfoRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/vouchers', voucherRoutes);



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

// Diagnostic route
app.get('/api/debug-env', (req, res) => {
  res.status(200).json({
    db: process.env.DATABASE_URL ? 'Set' : 'Missing',
    jwt: process.env.JWT_SECRET ? 'Set' : 'Missing',
    port: process.env.PORT || 'Missing',
    node_env: process.env.NODE_ENV,
    cwd: process.cwd(),
    dirname: __dirname,
  });
});

const logger = require('./config/logger');

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled Error', { message: err.message, stack: err.stack });
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: err.message,
    stack: err.stack
  });
});

module.exports = app;
