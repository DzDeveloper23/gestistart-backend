const Task = require('../models/Task');
const Project = require('../models/Project');
const Employee = require('../models/Employee');

class TaskService {
  // Créer une nouvelle tâche
  static async createTask(taskData, userId) {
    try {
      // Vérifier que le projet existe
      const project = await Project.findById(taskData.projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Si assigné, vérifier que l'employé existe
      if (taskData.assigneId) {
        const employee = await Employee.findById(taskData.assigneId);
        if (!employee) {
          throw new Error('Employé non trouvé');
        }
      }

      // Créer la tâche
      const newTask = new Task({
        ...taskData,
        createdBy: userId
      });

      await newTask.save();

      // Populate
      await newTask.populate('projectId', 'titre');
      await newTask.populate('assigneId', 'nom email');
      await newTask.populate('createdBy', 'nom email');
      await newTask.populate('commentaires.userId', 'nom email');

      return newTask;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer toutes les tâches (avec filtres)
  static async getAllTasks(filters = {}, page = 1, limit = 10) {
    try {
      const query = {};

      if (filters.projectId) {
        query.projectId = filters.projectId;
      }

      if (filters.assigneId) {
        query.assigneId = filters.assigneId;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.priorite) {
        query.priorite = filters.priorite;
      }

      const skip = (page - 1) * limit;

      const tasks = await Task.find(query)
        .populate('projectId', 'titre')
        .populate('assigneId', 'nom email')
        .populate('createdBy', 'nom email')
        .populate('commentaires.userId', 'nom email')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Task.countDocuments(query);

      return {
        tasks,
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

  // Récupérer une tâche par ID
  static async getTaskById(taskId) {
    try {
      const task = await Task.findById(taskId)
        .populate('projectId')
        .populate('assigneId', 'nom email poste')
        .populate('createdBy', 'nom email')
        .populate('commentaires.userId', 'nom email');

      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Mettre à jour une tâche
  static async updateTask(taskId, updateData) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      // Si assigné change, vérifier
      if (updateData.assigneId) {
        const employee = await Employee.findById(updateData.assigneId);
        if (!employee) {
          throw new Error('Employé non trouvé');
        }
      }

      Object.assign(task, updateData);
      await task.save();

      await task.populate('projectId', 'titre');
      await task.populate('assigneId', 'nom email');
      await task.populate('createdBy', 'nom email');
      await task.populate('commentaires.userId', 'nom email');

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Changer le statut d'une tâche (pour Kanban)
  static async updateStatus(taskId, newStatus) {
    try {
      const validStatuses = ['À faire', 'En cours', 'En révision', 'Terminée'];

      if (!validStatuses.includes(newStatus)) {
        throw new Error('Statut invalide');
      }

      const task = await Task.findByIdAndUpdate(
        taskId,
        { status: newStatus, updatedAt: Date.now() },
        { new: true }
      )
        .populate('projectId', 'titre')
        .populate('assigneId', 'nom email')
        .populate('commentaires.userId', 'nom email');

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Ajouter un commentaire
  static async addComment(taskId, userId, texte) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      task.commentaires.push({
        userId,
        texte,
        createdAt: Date.now()
      });

      await task.save();

      await task.populate('commentaires.userId', 'nom email');

      return task.commentaires;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un commentaire
  static async deleteComment(taskId, commentId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      task.commentaires = task.commentaires.filter(
        comment => comment._id.toString() !== commentId
      );

      await task.save();

      return task.commentaires;
    } catch (error) {
      throw error;
    }
  }

  // Assigner une tâche à un employé
  static async assignTask(taskId, employeeId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      task.assigneId = employeeId;
      await task.save();

      await task.populate('assigneId', 'nom email');

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Retirer l'assignation
  static async unassignTask(taskId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      task.assigneId = null;
      await task.save();

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Ajouter une pièce jointe
  static async addAttachment(taskId, nom, url) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      task.piecesJointes.push({
        nom,
        url,
        uploadedAt: Date.now()
      });

      await task.save();

      return task.piecesJointes;
    } catch (error) {
      throw error;
    }
  }

  // Retirer une pièce jointe
  static async removeAttachment(taskId, attachmentId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      task.piecesJointes = task.piecesJointes.filter(
        attachment => attachment._id.toString() !== attachmentId
      );

      await task.save();

      return task.piecesJointes;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les tâches par statut (pour Kanban)
  static async getTasksByStatus(projectId) {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      const tasks = await Task.find({ projectId })
        .populate('assigneId', 'nom email')
        .populate('createdBy', 'nom email')
        .sort({ priorite: -1 });

      // Grouper par statut
      const kanban = {
        'À faire': [],
        'En cours': [],
        'En révision': [],
        'Terminée': []
      };

      tasks.forEach(task => {
        kanban[task.status].push(task);
      });

      return kanban;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer une tâche
  static async deleteTask(taskId) {
    try {
      const task = await Task.findByIdAndDelete(taskId);

      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      return { message: 'Tâche supprimée avec succès' };
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques des tâches
  static async getTaskStats(projectId) {
    try {
      const tasks = await Task.find({ projectId });

      if (tasks.length === 0) {
        return {
          total: 0,
          aFaire: 0,
          enCours: 0,
          enRevision: 0,
          terminees: 0,
          enRetard: 0,
          parPriorite: {
            Basse: 0,
            Moyenne: 0,
            Haute: 0,
            Critique: 0
          }
        };
      }

      const now = new Date();
      let enRetard = 0;

      tasks.forEach(task => {
        if (
          task.dateEcheance &&
          new Date(task.dateEcheance) < now &&
          task.status !== 'Terminée'
        ) {
          enRetard++;
        }
      });

      return {
        total: tasks.length,
        aFaire: tasks.filter(t => t.status === 'À faire').length,
        enCours: tasks.filter(t => t.status === 'En cours').length,
        enRevision: tasks.filter(t => t.status === 'En révision').length,
        terminees: tasks.filter(t => t.status === 'Terminée').length,
        enRetard,
        parPriorite: {
          Basse: tasks.filter(t => t.priorite === 'Basse').length,
          Moyenne: tasks.filter(t => t.priorite === 'Moyenne').length,
          Haute: tasks.filter(t => t.priorite === 'Haute').length,
          Critique: tasks.filter(t => t.priorite === 'Critique').length
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TaskService;