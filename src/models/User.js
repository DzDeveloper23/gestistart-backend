const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');

// Définir le schéma (structure) des utilisateurs
const userSchema = new mongoose.Schema({
  // Email unique pour chaque user
  email: {
    type: String,
    required: [true, 'Email est obligatoire'],
    unique: true,
    lowercase: true, // Convertir en minuscules
    trim: true // Supprimer les espaces
  },

  // Nom complet
  nom: {
    type: String,
    required: [true, 'Nom est obligatoire']
  },

  // Mot de passe (sera hashé)
  password: {
    type: String,
    required: [true, 'Mot de passe est obligatoire'],
    minlength: 6
  },

  // Rôle utilisateur
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employé'],
    default: 'Admin'
  },

  // Status du compte
  status: {
    type: String,
    enum: ['Actif', 'Inactif'],
    default: 'Actif'
  },

  // Dates de création/modification
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware : Hacher le mot de passe AVANT de sauvegarder
userSchema.pre('save', async function(next) {
  // Si le password n'a pas changé, sauter cette étape
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Générer un "salt" (nombre aléatoire)
    const salt = await bcryptjs.genSalt(10);
    // Hacher le password avec le salt
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les passwords
userSchema.methods.comparePassword = async function(passwordEntree) {
  // Comparer password entré avec le hash en BD
  return await bcryptjs.compare(passwordEntree, this.password);
};

// Créer le modèle à partir du schéma
const User = mongoose.model('User', userSchema);

module.exports = User;