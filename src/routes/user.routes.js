const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { email, nom, password, role, status } = req.body;

    const newUser = await User.create({
      email,
      nom,
      password,
      role,
      status
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: newUser
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;