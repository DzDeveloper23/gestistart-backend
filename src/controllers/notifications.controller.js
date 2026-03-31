const NotificationService = require('../services/notification.service');

class NotificationsController {
  // GET /api/notifications - Récupérer toutes les notifications de l'utilisateur
  static async getNotifications(req, res) {
    try {
      const userId = req.user.userId;
      const { read } = req.query;

      const notifications = await NotificationService.getNotifications(userId, read);

      return res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/notifications/:id/read - Marquer comme lue
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const notification = await NotificationService.markAsRead(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Notification marquée comme lue',
        notification
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/notifications/read-all - Marquer toutes comme lues
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.userId;

      await NotificationService.markAllAsRead(userId);

      return res.status(200).json({
        success: true,
        message: 'Toutes les notifications sont marquées comme lues'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/notifications/:id - Supprimer une notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      await NotificationService.deleteNotification(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Notification supprimée'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/notifications/unread/count - Nombre de non-lues
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;

      const count = await NotificationService.getUnreadCount(userId);

      return res.status(200).json({
        success: true,
        count
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = NotificationsController;