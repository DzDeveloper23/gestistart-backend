const AuthService = require('../services/auth.service');

// Contrôleur : gérer les requêtes HTTP

class AuthController {
  // Route: POST /api/auth/register
  static async register(req, res) {
    try {
      // Récupérer les données du body
      const { email, nom, password, confirmPassword } = req.body;

      // ===== VALIDATIONS =====
      // Vérifier que les champs sont remplis
      if (!email || !nom || !password || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Tous les champs sont obligatoires'
        });
      }

      // Vérifier que les passwords correspondent
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: 'Les mots de passe ne correspondent pas'
        });
      }

      // Vérifier la longueur du password
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Le mot de passe doit faire au moins 6 caractères'
        });
      }

      // Vérifier le format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Email invalide'
        });
      }

      // ===== CRÉER L'UTILISATEUR =====
      const newUser = await AuthService.registerUser(
        email,
        nom,
        password,
        'Employé'
      );

      return res.status(201).json({
        success: true,
        message: 'Compte créé avec succès',
        user: newUser
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
// Route: GET /api/auth/users
static async getAllUsers(req, res) {
  try {
    const users = await AuthService.getAllUsers();

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
  // Route: POST /api/auth/login
  static async login(req, res) {
    try {
      // Récupérer les données du body
      const { email, password } = req.body;

      // ===== VALIDATIONS =====
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email et mot de passe requis'
        });
      }

      // ===== AUTHENTIFIER L'UTILISATEUR =====
      const data = await AuthService.loginUser(email, password);

      // Envoyer le token dans les cookies (optionnel mais plus sécurisé)
      res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true, // Inaccessible via JavaScript
        secure: process.env.NODE_ENV === 'production', // HTTPS seulement en prod
        sameSite: 'strict'
      });

      return res.status(200).json({
        success: true,
        message: 'Connexion réussie',
        accessToken: data.accessToken,
        user: data.user
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Route: POST /api/auth/refresh
  static async refresh(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token requis'
        });
      }

      const data = await AuthService.refreshToken(refreshToken);

      return res.status(200).json({
        success: true,
        accessToken: data.accessToken
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  // Route: GET /api/auth/me
  static async getCurrentUser(req, res) {
    try {
      // req.user est défini par le middleware d'authentification
      const user = await AuthService.getUserById(req.user.userId);

      return res.status(200).json({
        success: true,
        user
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
  // Route: PATCH /api/auth/users/:userId/role (Admin seulement)
static async updateUserRole(req, res) {
  try {
    // ✅ Vérifier que l'utilisateur courant est Admin
    const currentUser = await AuthService.getUserById(req.user.userId);
    if (currentUser.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé : Admin seulement'
      });
    }

    const { userId } = req.params;
    const { role } = req.body;

    // Validation du rôle
    const validRoles = ['Admin', 'Manager', 'Employé'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Rôle invalide'
      });
    }

    const updatedUser = await AuthService.updateUserRole(userId, role);

    return res.status(200).json({
      success: true,
      message: 'Rôle mis à jour',
      user: updatedUser
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
// Route: GET /api/auth/users/without-employee
static async getUsersWithoutEmployee(req, res) {
  try {
    const users = await AuthService.getUsersWithoutEmployee();

    return res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
}
  // Route: POST /api/auth/logout
  static async logout(req, res) {
    try {
      // Supprimer le cookie
      res.clearCookie('refreshToken');

      return res.status(200).json({
        success: true,
        message: 'Déconnexion réussie'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;