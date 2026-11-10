
const Notification = require('../models/Notification');
const { getIO } = require('../config/socket');

class NotificationService {
  static async createNotification(
    userId,
    title,
    message,
    type = 'info',
    relatedId = null,
    relatedType = null
  ) {
    try {
      const notification = new Notification({
        userId,
        title,
        message,
        type,
        relatedId,
        relatedType,
        read: false
      });

      // Enregistrer la notification dans MongoDB
      await notification.save();

      console.log('✅ Notification créée:', title);

      // Envoyer la notification en temps réel
      try {
        const io = getIO();

        if (io) {
          io.to(`user:${userId}`).emit('notification:new', notification);
          console.log('✅ Notification envoyée en temps réel');
        }
      } catch (socketError) {
        console.error('❌ Erreur Socket.IO:', socketError.message);
      }

      return notification;

    } catch (error) {
      console.error('❌ Erreur création notification:', error);
      throw error;
    }
  }

  static async getNotifications(userId, read = null) {
    try {
      const query = { userId };

      if (read !== null) {
        query.read = read === 'true';
      }

      const notifications = await Notification.find(query)
        .populate('userId', 'nom email')
        .populate('relatedId')
        .sort({ createdAt: -1 })
        .limit(50);

      return notifications;

    } catch (error) {
      throw error;
    }
  }

  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { read: true, updatedAt: new Date() },
        { new: true }
      );

      if (!notification || notification.userId.toString() !== userId) {
        throw new Error('Notification non trouvée');
      }

      console.log('✅ Notification marquée comme lue');
      return notification;

    } catch (error) {
      throw error;
    }
  }

  static async markAllAsRead(userId) {
    try {
      await Notification.updateMany(
        { userId, read: false },
        { read: true, updatedAt: new Date() }
      );

      console.log('✅ Toutes les notifications marquées comme lues');

    } catch (error) {
      throw error;
    }
  }

  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findByIdAndDelete(notificationId);

      if (!notification || notification.userId.toString() !== userId) {
        throw new Error('Notification non trouvée');
      }

      console.log('✅ Notification supprimée');

    } catch (error) {
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      return await Notification.countDocuments({
        userId,
        read: false
      });

    } catch (error) {
      throw error;
    }
  }

  static async cleanOldNotifications() {
    try {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      );

      const result = await Notification.deleteMany({
        createdAt: { $lt: thirtyDaysAgo },
        read: true
      });

      console.log(`✅ ${result.deletedCount} anciennes notifications supprimées`);

    } catch (error) {
      console.error('❌ Erreur nettoyage notifications:', error);
    }
  }
}

module.exports = NotificationService;
