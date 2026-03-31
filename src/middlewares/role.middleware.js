// role.middleware.js

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Convertir en array si c'est une chaîne
      const roles = Array.isArray(allowedRoles) 
        ? allowedRoles 
        : [allowedRoles];

      console.log('🔐 RoleMiddleware - User role:', req.user.role, 'Required:', roles);

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Accès refusé : permissions insuffisantes'
        });
      }

      next();
    } catch (error) {
      console.error('❌ Erreur roleMiddleware:', error);
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }
  };
};

module.exports = roleMiddleware;