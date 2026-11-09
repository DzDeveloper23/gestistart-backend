const jwt = require('jsonwebtoken');

// Middleware pour vérifier le JWT

const authMiddleware = (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    // Vérifier que le header existe et commence par "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant ou invalide'
      });
    }

    // Extraire le token (après "Bearer ")
    const token = authHeader.substring(7);

    // Vérifier la signature du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ajouter les infos de l'utilisateur à la requête
    req.user = decoded;

    // Passer au middleware suivant
    next();
  } catch (error) {
    // Si le token est expiré ou invalide
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expiré'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

module.exports = authMiddleware;