const mongoose = require('mongoose');

// Schéma pour les commentaires
const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  texte: {
    type: String,
    required: [true, 'Texte du commentaire obligatoire'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Schéma principal pour les tâches
const taskSchema = new mongoose.Schema({
  // Titre de la tâche
  titre: {
    type: String,
    required: [true, 'Titre obligatoire'],
    trim: true,
    minlength: [5, 'Le titre doit faire au minimum 5 caractères']
  },

  // Description
  description: {
    type: String,
    trim: true
  },

  // Projet associé
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, 'Projet obligatoire']
  },

  // Employé assigné
  assigneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },

  // Statut
  status: {
    type: String,
    enum: ['À faire', 'En cours', 'En révision', 'Terminée'],
    default: 'À faire'
  },

  // Priorité
  priorite: {
    type: String,
    enum: ['Basse', 'Moyenne', 'Haute', 'Critique'],
    default: 'Moyenne'
  },

  // Date limite
  dateEcheance: {
    type: Date
  },

  // Pièces jointes (URLs)
  piecesJointes: [
    {
      nom: String,
      url: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // Commentaires
  commentaires: [commentSchema],

  // Créé par
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Dates
  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware : Mettre à jour updatedAt
taskSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index pour les recherches rapides
taskSchema.index({ projectId: 1 });
taskSchema.index({ assigneId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priorite: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;