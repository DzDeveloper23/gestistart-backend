const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Service pour gérer la logique d'authentification

class AuthService {
  // Créer un nouvel utilisateur (Register)
  static async registerUser(email, nom, password, role = 'Employé') {
    try {
      // Vérifier si l'email existe déjà
      const userExiste = await User.findOne({ email });
      if (userExiste) {
        throw new Error('Cet email est déjà utilisé');
      }

      // Créer un nouvel utilisateur
      const newUser = new User({
        email,
        nom,
        password, // Sera hashé automatiquement par le middleware
        role
      });

      // Sauvegarder en BD
      await newUser.save();

      return {
        id: newUser._id,
        email: newUser.email,
        nom: newUser.nom,
        role: newUser.role
      };
    } catch (error) {
      throw error;
    }
  }
// Récupérer les utilisateurs qui n'ont pas encore d'employé associé
static async getUsersWithoutEmployee() {
  try {
    const Employee = require('../models/Employee');
    
    // Récupérer tous les userId des employés existants
    const employees = await Employee.find().select('userId');
    const employeeUserIds = employees.map(emp => emp.userId.toString());

    // Récupérer les utilisateurs qui ne sont pas dans cette liste
    const users = await User.find({
      _id: { $nin: employeeUserIds },
      status: 'Actif'
    }).select('_id email nom role');

    return users;
  } catch (error) {
    throw error;
  }
}
  // Authentifier un utilisateur (Login)
  static async loginUser(email, password) {
    try {
      // Chercher l'utilisateur par email
      const user = await User.findOne({ email });
      
      // Si user n'existe pas
      if (!user) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier le password
      const passwordValide = await user.comparePassword(password);
      
      // Si password incorrect
      if (!passwordValide) {
        throw new Error('Email ou mot de passe incorrect');
      }

      // Vérifier que le compte est actif
      if (user.status !== 'Actif') {
        throw new Error('Ce compte est désactivé');
      }

      // Générer les tokens JWT
      const tokens = this.generateTokens(user._id, user.role, user.email);

      return {
        user: {
          id: user._id,
          email: user.email,
          nom: user.nom,
          role: user.role
        },
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  // Générer JWT access token et refresh token
  static generateTokens(userId, role, email) {
    // Access Token (court, 1h)
    const accessToken = jwt.sign(
      { userId, role, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Refresh Token (long, 7j)
    const refreshToken = jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Vérifier et renouveler le token
  static async refreshToken(refreshToken) {
    try {
      // Vérifier la signature du refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      
      // Chercher l'utilisateur
      const user = await User.findById(decoded.userId);
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      // Générer un nouveau access token
      const newAccessToken = jwt.sign(
        { userId: user._id, role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  // Obtenir les infos de l'utilisateur courant
  static async getUserById(userId) {
    try {
      const user = await User.findById(userId).select('-password');
      
      if (!user) {
        throw new Error('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      throw error;
    }
  }
  // Mettre à jour le rôle d'un utilisateur (Admin seulement)
static async updateUserRole(userId, newRole) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    user.role = newRole;
    await user.save();

    return {
      id: user._id,
      email: user.email,
      nom: user.nom,
      role: user.role
    };
  } catch (error) {
    throw error;
  }
}
// Récupérer TOUS les utilisateurs
static async getAllUsers() {
  try {
    const users = await User.find().select('_id email nom role status');
    return users;
  } catch (error) {
    throw error;
  }
}
// Récupérer les utilisateurs qui n'ont pas encore d'employé associé
static async getUsersWithoutEmployee() {
  try {
    const Employee = require('../models/Employee');
    
    // Récupérer tous les employés avec userId
    const employees = await Employee.find().select('userId');
    
    // Mapper les IDs en filtrant les undefined
    const employeeUserIds = employees
      .filter(emp => emp.userId) // ✅ Filtrer les employés sans userId
      .map(emp => emp.userId.toString());

    console.log('📊 Employés trouvés:', employees.length);
    console.log('✅ UserIds valides:', employeeUserIds.length);

    // Récupérer les utilisateurs qui ne sont pas dans cette liste
    const users = await User.find({
      _id: { $nin: employeeUserIds },
      status: 'Actif'
    }).select('_id email nom role');

    console.log('👥 Utilisateurs sans employé:', users.length);

    return users;
  } catch (error) {
    console.error('❌ Erreur getUsersWithoutEmployee:', error);
    throw error;
  }
}
}

module.exports = AuthService;