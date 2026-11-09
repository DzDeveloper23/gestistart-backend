const express = require('express');
const NotificationsController = require('../controllers/notifications.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// ===== MIDDLEWARE : Tous les routes nécessitent authentification =====
router.use(authMiddleware);

// ===== ROUTES =====

// GET - Récupérer toutes les notifications
router.get('/', NotificationsController.getNotifications);

// GET - Nombre de notifications non-lues
router.get('/unread/count', NotificationsController.getUnreadCount);

// PATCH - Marquer une notification comme lue
router.patch('/:id/read', NotificationsController.markAsRead);

// PATCH - Marquer toutes comme lues
router.patch('/read-all', NotificationsController.markAllAsRead);

// DELETE - Supprimer une notification
router.delete('/:id', NotificationsController.deleteNotification);

module.exports = router;