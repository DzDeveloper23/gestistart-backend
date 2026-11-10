
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/database');
const errorMiddleware = require('./middlewares/error.middleware');
const { initSocket } = require('./config/socket');

const app = express();

// ===== CORS CONFIGURATION =====
const corsOptions = {
  origin: [
    'http://localhost:4200',
    'https://gestistart-frontend.vercel.app',
    'https://gestistart.vercel.app'
  ],
  methods: [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ],
  credentials: true,
  optionsSuccessStatus: 204
};

// ===== MIDDLEWARE =====
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

// ===== CONNEXION BD =====
connectDB();

// ===== ROUTES =====
app.get('/api/health', (req, res) => {
  res.json({
    message: '✅ Serveur fonctionnel'
  });
});

app.use('/api/users', require('./routes/user.routes'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/projects', require('./routes/projects.routes'));
app.use('/api/tasks', require('./routes/tasks.routes'));
app.use('/api/clients', require('./routes/clients.routes'));
app.use('/api/employees', require('./routes/employees.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));

// ===== ERROR MIDDLEWARE =====
app.use(errorMiddleware);

// ===== SOCKET.IO + HTTP SERVER =====
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log('✅ Socket.IO initialisé');
});

module.exports = app;
