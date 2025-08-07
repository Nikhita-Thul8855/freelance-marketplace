const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

// Load environment variables
require("dotenv").config();

// Production environment variables validation
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Fallback environment variables for development
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI = "mongodb://localhost:27017/freelance-marketplace";
  process.env.JWT_SECRET = "freelance_marketplace_super_secret_key_2024_production_ready";
  process.env.PORT = "5000";
  process.env.NODE_ENV = "development";
  console.log("🔧 Using fallback environment variables for development");
}

const connectDB = require("./config/db");

console.log("🌍 Environment variables status:");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✓ Loaded" : "✗ Not found");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✓ Loaded" : "✗ Not found");
console.log("PORT:", process.env.PORT ? "✓ Loaded" : "✗ Not found");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");

const app = express();
const server = http.createServer(app);

// Production-ready CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allowed origins for production
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://localhost:3000',
      'https://localhost:3001',
      // Production Vercel URLs
      'https://freelance-marketplace-blyp.vercel.app',
      'https://freelance-marketplace-blyp-h3243xgxh-nikhita-taksandes-projects.vercel.app',
      // Environment variables
      process.env.FRONTEND_URL,
      process.env.CLIENT_URL
    ].filter(Boolean); // Remove undefined values
    
    // In development, allow localhost with any port
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log rejected origins in production
    if (process.env.NODE_ENV === 'production') {
      console.warn('❌ CORS: Origin not allowed:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
    
    // Allow all in development
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  if (req.headers.authorization) {
    console.log('Auth header present:', req.headers.authorization.substring(0, 20) + '...');
  } else {
    console.log('No auth header');
  }
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/deliverables', express.static(path.join(__dirname, 'uploads/deliverables')));

// Connect to DB
connectDB();

// Health check endpoint for deployment platforms
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Freelance Marketplace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/gigs', require('./routes/gigs'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/deliverables', require('./routes/deliverables'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/admin'));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error('Path:', req.path);
  console.error('Method:', req.method);
  console.error('Body:', req.body);
  console.error('Error:', error);
  console.error('Stack:', error.stack);
  
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Freelance Marketplace API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      gigs: "/api/gigs",
      payments: "/api/payments",
      orders: "/api/orders"
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

// Socket.io real-time messaging
require('./socket/messageSocket')(io);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready for real-time messaging`);
});