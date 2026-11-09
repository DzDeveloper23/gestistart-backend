const mongoose = require('mongoose');

// Fonction pour connecter à MongoDB
const connectDB = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    // Arrêter le serveur si la BD ne se connecte pas
    process.exit(1);
  }
};

module.exports = connectDB;