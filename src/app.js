require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());

// ===== CORS =====
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// 👉 IMPORTANT : remplacer app.options('*') par :
app.options('/*', cors());

// ===== ROUTES =====
const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: "ok" });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Internal Server Error"
  });
});

// ===== CONNECT DB + START SERVER =====
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });