const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID obligatoire']
  },

  nom: {
    type: String,
    required: [true, 'Nom obligatoire'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email obligatoire'],
    trim: true,
    lowercase: true
  },

  poste: {
    type: String,
    required: [true, 'Poste obligatoire'],
    trim: true
  },

  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employé'],
    default: 'Employé'
  },

  salaire: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['Actif', 'Inactif', 'Congé'],
    default: 'Actif'
  },

  dateEmbauche: {
    type: Date,
    required: [true, 'Date embauche obligatoire']
  },

  projectsAssignes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }
  ]
}, {
  timestamps: true, // Ajoute automatiquement createdAt et updatedAt
  collection: 'employees' // ✅ FORCE la collection employees
});

// Index pour améliorer les performances
employeeSchema.index({ userId: 1 });
employeeSchema.index({ email: 1 });
employeeSchema.index({ status: 1 });

// ✅ TRIPLE PROTECTION : Nom du modèle + collection forcée
const Employee = mongoose.model('Employee', employeeSchema, 'employees');



module.exports = Employee;