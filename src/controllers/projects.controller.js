const ProjectService = require('../services/project.service');
const NotificationService = require('../services/notification.service');

class ProjectsController {
  // POST /api/projects - Créer un projet
  static async createProject(req, res) {
    try {
      const {
        titre,
        description,
        clientId,
        budget,
        dateDebut,
        dateFin,
        priorite,
        notes,
        team = []
      } = req.body;

      // ===== VALIDATIONS =====
      if (!titre || !clientId || !budget || !dateDebut || !dateFin) {
        return res.status(400).json({
          success: false,
          message: 'Titre, client, budget et dates sont obligatoires'
        });
      }

      if (isNaN(budget) || budget <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Le budget doit être un nombre positif'
        });
      }

      if (new Date(dateFin) <= new Date(dateDebut)) {
        return res.status(400).json({
          success: false,
          message: 'La date de fin doit être après la date de début'
        });
      }

      // ===== CRÉER LE PROJET =====
      const project = await ProjectService.createProject(
        {
          titre,
          description,
          clientId,
          budget,
          dateDebut,
          dateFin,
          priorite,
          notes,
          team
        },
        req.user.userId
      );

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Nouveau projet créé',
        `Le projet "${titre}" a été créé avec succès`,
        'success',
        project._id,
        'project'
      );

      return res.status(201).json({
        success: true,
        message: 'Projet créé avec succès',
        project
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/projects - Récupérer tous les projets
  static async getAllProjects(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.priorite) filters.priorite = req.query.priorite;
      if (req.query.clientId) filters.clientId = req.query.clientId;

      const data = await ProjectService.getAllProjects(filters, page, limit);

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

  // GET /api/projects/:id - Récupérer un projet par ID
  static async getProjectById(req, res) {
    try {
      const { id } = req.params;

      const project = await ProjectService.getProjectById(id);

      return res.status(200).json({
        success: true,
        project
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/projects/:id - Mettre à jour un projet
  static async updateProject(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validation: vérifier les dates si mises à jour
      if (updateData.dateDebut && updateData.dateFin) {
        if (new Date(updateData.dateFin) <= new Date(updateData.dateDebut)) {
          return res.status(400).json({
            success: false,
            message: 'La date de fin doit être après la date de début'
          });
        }
      }

      const project = await ProjectService.updateProject(id, updateData);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Projet mis à jour',
        `Le projet "${project.titre}" a été modifié`,
        'info',
        project._id,
        'project'
      );

      return res.status(200).json({
        success: true,
        message: 'Projet mis à jour avec succès',
        project
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/projects/:id/status - Changer le statut
  static async updateProjectStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Le statut est obligatoire'
        });
      }

      const validStatuses = ['En cours', 'En attente', 'Terminé', 'Suspendu'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Le statut doit être l'un de: ${validStatuses.join(', ')}`
        });
      }

      const project = await ProjectService.updateProjectStatus(id, status);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Statut du projet changé',
        `Le projet "${project.titre}" est maintenant ${status}`,
        'info',
        project._id,
        'project'
      );

      return res.status(200).json({
        success: true,
        message: `Statut du projet changé en "${status}"`,
        project
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/projects/:id - Supprimer un projet
  static async deleteProject(req, res) {
    try {
      const { id } = req.params;

      // Récupérer le projet avant suppression
      const Project = require('../models/Project');
      const project = await Project.findById(id);
      const projectName = project?.titre || 'Projet inconnu';

      const result = await ProjectService.deleteProject(id);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Projet supprimé',
        `Le projet "${projectName}" a été supprimé`,
        'warning',
        null,
        'project'
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

  // POST /api/projects/:id/team - Assigner une équipe
  static async assignTeam(req, res) {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body;

      if (!employeeIds || !Array.isArray(employeeIds)) {
        return res.status(400).json({
          success: false,
          message: 'employeeIds doit être un tableau'
        });
      }

      const project = await ProjectService.assignTeam(id, employeeIds);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Équipe assignée au projet',
        `${employeeIds.length} membre(s) assigné(s) au projet`,
        'info',
        project._id,
        'project'
      );

      return res.status(200).json({
        success: true,
        message: 'Équipe assignée avec succès',
        project
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/projects/:id/team/:employeeId - Ajouter un employé
  static async addTeamMember(req, res) {
    try {
      const { id, employeeId } = req.params;

      const project = await ProjectService.addTeamMember(id, employeeId);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Membre ajouté au projet',
        `Un membre a été ajouté au projet "${project.titre}"`,
        'info',
        project._id,
        'project'
      );

      return res.status(200).json({
        success: true,
        message: 'Employé ajouté au projet',
        project
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/projects/:id/team/:employeeId - Retirer un employé
  static async removeTeamMember(req, res) {
    try {
      const { id, employeeId } = req.params;

      const project = await ProjectService.removeTeamMember(id, employeeId);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Membre retiré du projet',
        `Un membre a été retiré du projet "${project.titre}"`,
        'warning',
        project._id,
        'project'
      );

      return res.status(200).json({
        success: true,
        message: 'Employé retiré du projet',
        project
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/projects/:id/stats - Obtenir les stats d'un projet
  static async getProjectStats(req, res) {
    try {
      const { id } = req.params;

      const stats = await ProjectService.getProjectStats(id);

      return res.status(200).json({
        success: true,
        stats
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = ProjectsController;