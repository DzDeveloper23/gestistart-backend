const mongoose = require('mongoose');

// Schéma pour les projets
const projectSchema = new mongoose.Schema({
  // Titre du projet
  titre: {
    type: String,
    required: [true, 'Titre du projet obligatoire'],
    trim: true,
    minlength: [3, 'Le titre doit faire au minimum 3 caractères']
  },

  // Description
  description: {
    type: String,
    trim: true
  },

  // Client associé
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client obligatoire']
  },

  // Équipe assignée (plusieurs employés)
  team: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  ],

  // Statut du projet
  status: {
    type: String,
    enum: ['En cours', 'En attente', 'Terminé', 'Suspendu'],
    default: 'En attente'
  },

  // Budget alloué
  budget: {
    type: Number,
    required: [true, 'Budget obligatoire'],
    min: 0
  },

  // Montant déjà utilisé
  montantUtilise: {
    type: Number,
    default: 0,
    min: 0
  },

  // Dates
  dateDebut: {
    type: Date,
    required: [true, 'Date de début obligatoire']
  },

  dateFin: {
    type: Date,
    required: [true, 'Date de fin obligatoire']
  },

  // Priorité
  priorite: {
    type: String,
    enum: ['Basse', 'Moyenne', 'Haute', 'Critique'],
    default: 'Moyenne'
  },

  // Notes
  notes: {
    type: String,
    trim: true
  },

  // Créé par (Admin/Manager)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Middleware : Mettre à jour updatedAt avant chaque modification
projectSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index pour les recherches rapides
projectSchema.index({ clientId: 1 });
projectSchema.index({ status: 1 });
projectSchema.index({ createdBy: 1 });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;