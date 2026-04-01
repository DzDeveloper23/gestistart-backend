require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ message: '✅ Serveur fonctionnel' });
});

// ===== ROUTES =====
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/clients', require('./routes/clients.routes'));
app.use('/api/employees', require('./routes/employees.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// ===== MIDDLEWARE ERREUR =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// ===== DÉMARRER SERVEUR =====
const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`✅ Serveur démarré sur le port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    process.exit(1);
  }
};

start();

module.exports = app;