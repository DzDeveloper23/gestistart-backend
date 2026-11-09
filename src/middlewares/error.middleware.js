// Middleware de gestion d'erreurs global

const errorMiddleware = (err, req, res, next) => {
  // Status par défaut
  const status = err.status || 500;
  
  // Message par défaut
  let message = err.message || 'Erreur serveur';

  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(', ');
    return res.status(400).json({
      success: false,
      message,
      errors: err.errors
    });
  }

  // Erreurs de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} existe déjà`;
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Erreur Cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    message = 'ID invalide';
    return res.status(400).json({
      success: false,
      message
    });
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    message = 'Token expiré';
    return res.status(401).json({
      success: false,
      message
    });
  }

  // Erreur JWT invalide
  if (err.name === 'JsonWebTokenError') {
    message = 'Token invalide';
    return res.status(401).json({
      success: false,
      message
    });
  }

  // Réponse générique
  return res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
};

module.exports = errorMiddleware;