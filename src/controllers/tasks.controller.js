const TaskService = require('../services/task.service');
const NotificationService = require('../services/notification.service');

class TasksController {
  // POST /api/tasks - Créer une tâche
  static async createTask(req, res) {
    try {
      const {
        titre,
        description,
        projectId,
        assigneId,
        priorite,
        dateEcheance
      } = req.body;

      // ===== VALIDATIONS =====
      if (!titre || !projectId) {
        return res.status(400).json({
          success: false,
          message: 'Titre et projet sont obligatoires'
        });
      }

      if (titre.length < 5) {
        return res.status(400).json({
          success: false,
          message: 'Le titre doit faire au minimum 5 caractères'
        });
      }

      // ===== CRÉER LA TÂCHE =====
      const task = await TaskService.createTask(
        {
          titre,
          description,
          projectId,
          assigneId,
          priorite,
          dateEcheance
        },
        req.user.userId
      );

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Nouvelle tâche créée',
        `La tâche "${titre}" a été créée`,
        'success',
        task._id,
        'task'
      );

      // ✅ SI ASSIGNÉE À QUELQU'UN, NOTIFIER AUSSI CET UTILISATEUR
      if (assigneId) {
        await NotificationService.createNotification(
          assigneId,
          'Tâche assignée',
          `Vous avez une nouvelle tâche : "${titre}"`,
          'warning',
          task._id,
          'task'
        );
      }

      return res.status(201).json({
        success: true,
        message: 'Tâche créée avec succès',
        task
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/tasks - Récupérer toutes les tâches
  static async getAllTasks(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.projectId) filters.projectId = req.query.projectId;
      if (req.query.assigneId) filters.assigneId = req.query.assigneId;
      if (req.query.status) filters.status = req.query.status;
      if (req.query.priorite) filters.priorite = req.query.priorite;

      const data = await TaskService.getAllTasks(filters, page, limit);

      return res.status(200).json({
        success: true,
        ...data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/tasks/:id - Récupérer une tâche
  static async getTaskById(req, res) {
    try {
      const { id } = req.params;

      const task = await TaskService.getTaskById(id);

      return res.status(200).json({
        success: true,
        task
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/tasks/:id - Mettre à jour une tâche
  static async updateTask(req, res) {
    try {
      const { id } = req.params;

      const task = await TaskService.updateTask(id, req.body);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Tâche mise à jour',
        `La tâche "${task.titre}" a été modifiée`,
        'info',
        task._id,
        'task'
      );

      return res.status(200).json({
        success: true,
        message: 'Tâche mise à jour avec succès',
        task
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/tasks/:id/status - Changer le statut (Kanban)
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Statut obligatoire'
        });
      }

      const task = await TaskService.updateStatus(id, status);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Statut de la tâche changé',
        `La tâche "${task.titre}" est maintenant ${status}`,
        'info',
        task._id,
        'task'
      );

      return res.status(200).json({
        success: true,
        message: 'Statut mis à jour',
        task
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/tasks/:id - Supprimer une tâche
  static async deleteTask(req, res) {
    try {
      const { id } = req.params;

      // Récupérer la tâche avant suppression
      const Task = require('../models/Task');
      const task = await Task.findById(id);
      const taskName = task?.titre || 'Tâche inconnue';

      const result = await TaskService.deleteTask(id);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Tâche supprimée',
        `La tâche "${taskName}" a été supprimée`,
        'warning',
        null,
        'task'
      );

      return res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== ASSIGNATION =====

  // POST /api/tasks/:id/assign - Assigner une tâche
  static async assignTask(req, res) {
    try {
      const { id } = req.params;
      const { employeeId } = req.body;

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: 'Employé obligatoire'
        });
      }

      const task = await TaskService.assignTask(id, employeeId);

      // ✅ NOTIFIER L'ASSIGNÉ
      await NotificationService.createNotification(
        employeeId,
        'Tâche assignée',
        `Vous avez une nouvelle tâche : "${task.titre}"`,
        'warning',
        task._id,
        'task'
      );

      return res.status(200).json({
        success: true,
        message: 'Tâche assignée',
        task
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/tasks/:id/assign - Retirer assignation
  static async unassignTask(req, res) {
    try {
      const { id } = req.params;

      const task = await TaskService.unassignTask(id);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Assignation retirée',
        `L'assignation de la tâche "${task.titre}" a été retirée`,
        'info',
        task._id,
        'task'
      );

      return res.status(200).json({
        success: true,
        message: 'Assignation retirée',
        task
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== COMMENTAIRES =====

  // POST /api/tasks/:id/comments - Ajouter un commentaire
  static async addComment(req, res) {
    try {
      const { id } = req.params;
      const { texte } = req.body;

      if (!texte) {
        return res.status(400).json({
          success: false,
          message: 'Texte du commentaire obligatoire'
        });
      }

      const commentaires = await TaskService.addComment(
        id,
        req.user.userId,
        texte
      );

      return res.status(201).json({
        success: true,
        message: 'Commentaire ajouté',
        commentaires
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/tasks/:id/comments/:commentId - Supprimer commentaire
  static async deleteComment(req, res) {
    try {
      const { id, commentId } = req.params;

      const commentaires = await TaskService.deleteComment(id, commentId);

      return res.status(200).json({
        success: true,
        message: 'Commentaire supprimé',
        commentaires
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== PIÈCES JOINTES =====

  // POST /api/tasks/:id/attachments - Ajouter fichier
  static async addAttachment(req, res) {
    try {
      const { id } = req.params;
      const { nom, url } = req.body;

      if (!nom || !url) {
        return res.status(400).json({
          success: false,
          message: 'Nom et URL obligatoires'
        });
      }

      const piecesJointes = await TaskService.addAttachment(id, nom, url);

      return res.status(201).json({
        success: true,
        message: 'Fichier ajouté',
        piecesJointes
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/tasks/:id/attachments/:attachmentId - Retirer fichier
  static async removeAttachment(req, res) {
    try {
      const { id, attachmentId } = req.params;

      const piecesJointes = await TaskService.removeAttachment(
        id,
        attachmentId
      );

      return res.status(200).json({
        success: true,
        message: 'Fichier supprimé',
        piecesJointes
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== KANBAN =====

  // GET /api/tasks/project/:projectId/kanban - Vue Kanban
  static async getKanbanView(req, res) {
    try {
      const { projectId } = req.params;

      const kanban = await TaskService.getTasksByStatus(projectId);

      return res.status(200).json({
        success: true,
        kanban
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== STATISTIQUES =====

  // GET /api/tasks/project/:projectId/stats - Stats des tâches
  static async getTaskStats(req, res) {
    try {
      const { projectId } = req.params;

      const stats = await TaskService.getTaskStats(projectId);

      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TasksController;