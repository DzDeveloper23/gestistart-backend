const Project = require('../models/Project');
const Employee = require('../models/Employee');
const Client = require('../models/Client');

class ProjectService {
  // Créer un nouveau projet
  static async createProject(projectData, userId) {
    try {
      // Vérifier que le client existe
      const client = await Client.findById(projectData.clientId);
      if (!client) {
        throw new Error('Client non trouvé');
      }

      // Vérifier que la date de fin est après la date de début
      if (new Date(projectData.dateFin) < new Date(projectData.dateDebut)) {
        throw new Error('La date de fin doit être après la date de début');
      }

      // Créer le projet
      const newProject = new Project({
        ...projectData,
        createdBy: userId
      });

      // Sauvegarder
      await newProject.save();

      // Populate les références
      await newProject.populate('clientId', 'nomEntreprise');
      await newProject.populate('team', 'nom email');
      await newProject.populate('createdBy', 'nom email');

      return newProject;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer tous les projets (avec filtres optionnels)
  static async getAllProjects(filters = {}, page = 1, limit = 10) {
    try {
      // Construire les filtres
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priorite) {
        query.priorite = filters.priorite;
      }

      if (filters.clientId) {
        query.clientId = filters.clientId;
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Récupérer les projets avec relations
      const projects = await Project.find(query)
        .populate('clientId', 'nomEntreprise email')
        .populate('team', 'nom email')
        .populate('createdBy', 'nom email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      // Compter le total
      const total = await Project.countDocuments(query);

      return {
        projects,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupérer un projet par ID
  static async getProjectById(projectId) {
    try {
      const project = await Project.findById(projectId)
        .populate('clientId')
        .populate('team', 'nom email poste')
        .populate('createdBy', 'nom email');

      if (!project) {
        throw new Error('Projet non trouvé');
      }

      return project;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour un projet
  static async updateProject(projectId, updateData) {
    try {
      // Vérifier que le projet existe
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Si la date change, la vérifier
      if (updateData.dateFin && updateData.dateDebut) {
        if (new Date(updateData.dateFin) < new Date(updateData.dateDebut)) {
          throw new Error('La date de fin doit être après la date de début');
        }
      }

      // Mettre à jour les champs
      Object.assign(project, updateData);

      // Sauvegarder
      await project.save();

      // Populate
      await project.populate('clientId', 'nomEntreprise');
      await project.populate('team', 'nom email');
      await project.populate('createdBy', 'nom email');

      return project;
    } catch (error) {
      throw error;
    }
  }

  // ✅ NOUVEAU - Changer le statut d'un projet
  static async updateProjectStatus(projectId, status) {
    try {
      // Vérifier que le projet existe
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Valider le statut
      const validStatuses = ['En cours', 'En attente', 'Terminé', 'Suspendu'];
      if (!validStatuses.includes(status)) {
        throw new Error(`Le statut doit être l'un de: ${validStatuses.join(', ')}`);
      }

      // Mettre à jour le statut
      project.status = status;
      project.updatedAt = new Date();

      // Sauvegarder
      await project.save();

      // Populate
      await project.populate('clientId', 'nomEntreprise');
      await project.populate('team', 'nom email');
      await project.populate('createdBy', 'nom email');

      return project;
    } catch (error) {
      throw error;
    }
  }

  // Assigner une équipe au projet
  static async assignTeam(projectId, employeeIds) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Vérifier que tous les employés existent
      const employees = await Employee.find({ _id: { $in: employeeIds } });
      if (employees.length !== employeeIds.length) {
        throw new Error('Un ou plusieurs employés n\'existent pas');
      }

      // Assigner
      project.team = employeeIds;
      await project.save();

      await project.populate('team', 'nom email');

      return project;
    } catch (error) {
      throw error;
    }
  }

  // Ajouter un employé à l'équipe
  static async addTeamMember(projectId, employeeId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      // Vérifier si l'employé n'est pas déjà assigné
      if (project.team.includes(employeeId)) {
        throw new Error('Employé déjà assigné au projet');
      }

      // Ajouter
      project.team.push(employeeId);
      await project.save();

      await project.populate('team', 'nom email');

      return project;
    } catch (error) {
      throw error;
    }
  }

  // Retirer un employé de l'équipe
  static async removeTeamMember(projectId, employeeId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Retirer
      project.team = project.team.filter(id => id.toString() !== employeeId);
      await project.save();

      await project.populate('team', 'nom email');

      return project;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un projet
  static async deleteProject(projectId) {
    try {
      const project = await Project.findByIdAndDelete(projectId);

      if (!project) {
        throw new Error('Projet non trouvé');
      }

      return { message: 'Projet supprimé avec succès' };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques d'un projet
  static async getProjectStats(projectId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Calculer le pourcentage du budget utilisé
      const budgetPercent = (project.montantUtilise / project.budget) * 100;

      // Calculer les jours restants
      const now = new Date();
      const fin = new Date(project.dateFin);
      const joursRestants = Math.ceil((fin - now) / (1000 * 60 * 60 * 24));

      return {
        budgetTotal: project.budget,
        budgetUtilise: project.montantUtilise,
        budgetPercent: budgetPercent.toFixed(2),
        budgetRestant: project.budget - project.montantUtilise,
        joursRestants: joursRestants > 0 ? joursRestants : 0,
        isEnRetard: joursRestants < 0,
        nombreMembers: project.team.length,
        status: project.status
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProjectService;