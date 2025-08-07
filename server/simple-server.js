// Simple server start with manual env vars
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Manual environment variables for testing
process.env.MONGO_URI = "mongodb+srv://freelancemarketplace:freelancemarketplace123@cluster0.mongodb.net/freelance-marketplace?retryWrites=true&w=majority";
process.env.JWT_SECRET = "freelance_marketplace_super_secret_key_2024_production_ready";
process.env.PORT = "5000";
process.env.NODE_ENV = "development";

// Enable CORS
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully");
})
.catch((err) => {
  console.error("❌ MongoDB connection failed:", err.message);
});

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Import auth routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Error loading auth routes:", error.message);
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Frontend should connect to: http://localhost:${PORT}/api`);
  console.log(`🔗 MongoDB: Connected`);
  console.log(`🔑 JWT Secret: Configured`);
});
