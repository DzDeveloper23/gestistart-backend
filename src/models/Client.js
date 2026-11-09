const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  nomContact: {
    type: String,
    required: [true, 'Nom du contact obligatoire'],
    trim: true
  },

  nomEntreprise: {
    type: String,
    required: [true, 'Nom entreprise obligatoire'],
    trim: true
  },

  email: {
    type: String,
    required: [true, 'Email obligatoire'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide'],
    trim: true,
    lowercase: true
  },

  telephone: {
    type: String,
    trim: true
  },

  adresse: {
    type: String,
    trim: true
  },

  notes: {
    type: String,
    trim: true
  },

  status: {
    type: String,
    enum: ['Actif', 'Inactif', 'Prospect'],
    default: 'Prospect'
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

clientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;