require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();

// ===== MIDDLEWARE =====
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:4200',
    'https://gestistart-frontend.vercel.app'
  ],
  credentials: true
}));

// ===== CONNEXION BD =====
connectDB();

// ===== ROUTES =====
app.get('/api/health', (req, res) => {
  res.json({ message: '✅ Serveur fonctionnel' });
});

app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/clients', require('./routes/clients.routes'));
app.use('/api/employees', require('./routes/employees.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// ===== MIDDLEWARE D'ERREUR (À LA FIN) =====
app.use(errorMiddleware);

// ===== DÉMARRER LE SERVEUR =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});

module.exports = app;