
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:4200',
        'https://gestistart-frontend.vercel.app',
        'https://gestistart.vercel.app'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Authentification avec JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Token manquant'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.userId) {
        return next(new Error('Utilisateur invalide'));
      }

      socket.userId = decoded.userId;
      next();

    } catch (error) {
      next(new Error('Token invalide'));
    }
  });

  // Connexion utilisateur
  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    console.log(`✅ Utilisateur connecté à Socket.IO : ${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur déconnecté : ${socket.userId}`);
    });
  });

  return io;
};

// Récupérer Socket.IO
const getIO = () => {
  return io;
};

module.exports = {
  initSocket,
  getIO
};
