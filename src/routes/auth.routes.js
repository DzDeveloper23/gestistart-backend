const express = require('express');
const AuthController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// Routes publiques
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
// ✅ NOUVELLE ROUTE : Récupérer TOUS les utilisateurs
router.get('/users', AuthController.getAllUsers);

// ✅ NOUVELLE ROUTE : Récupérer les utilisateurs sans employé
router.get('/users/without-employee', AuthController.getUsersWithoutEmployee);

// Routes protégées
router.get('/me', authMiddleware, AuthController.getCurrentUser);

// ✅ NOUVELLE ROUTE : Récupérer les utilisateurs sans employé
router.get('/users/without-employee', authMiddleware, AuthController.getUsersWithoutEmployee);

module.exports = router;