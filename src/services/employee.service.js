const Employee = require('../models/Employee');
const User = require('../models/User');
const Task = require('../models/Task');
const Project = require('../models/Project');

// ✅ Vérification au chargement du service
console.log('🔍 EmployeeService - Modèles chargés:');
console.log('   Employee.modelName:', Employee.modelName);
console.log('   Employee.collection.name:', Employee.collection.name);
console.log('   User.modelName:', User.modelName);
console.log('   User.collection.name:', User.collection.name);

class EmployeeService {
  // ✅ Créer un nouvel employé
 static async createEmployee(employeeData) {
  try {
    // Vérifier que l'utilisateur existe
    const user = await User.findById(employeeData.userId);
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Vérifier qu'un employé n'existe pas déjà pour ce user
    const employeeExiste = await Employee.findOne({
      userId: employeeData.userId
    });
    if (employeeExiste) {
      throw new Error('Employé existe déjà pour cet utilisateur');
    }

    // ✅ Créer l'employé dans la collection 'employees'
    const newEmployee = new Employee({
      ...employeeData,
      email: user.email,
      nom: user.nom
    });

    await newEmployee.save(); // ✅ Sauvegarde dans 'employees'

    return newEmployee;
  } catch (error) {
    throw error;
  }
}

  // Récupérer tous les employés
  static async getAllEmployees(filters = {}, page = 1, limit = 10) {
    try {
      console.log('🔍 DEBUG getAllEmployees - Collection:', Employee.collection.name);
      
      const query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.search) {
        query.$or = [
          { nom: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { poste: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;

      const employees = await Employee.find(query)
        .populate('userId', 'nom email')
        .populate('projectsAssignes', 'titre status')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Employee.countDocuments(query);

      console.log(`✅ ${employees.length} employés trouvés dans ${Employee.collection.name}`);

      return {
        employees,
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

  // Récupérer un employé par ID
  static async getEmployeeById(employeeId) {
    try {
      const employee = await Employee.findById(employeeId)
        .populate('userId', 'nom email')
        .populate('projectsAssignes', 'titre status budget');

      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      // Récupérer les tâches assignées
      const tasks = await Task.find({ assigneId: employeeId })
        .select('titre status priorite dateEcheance projectId');

      return {
        employee,
        tasks
      };
    } catch (error) {
      throw error;
    }
  }

// Mettre à jour un employé
  static async updateEmployee(employeeId, updateData) {
    try {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      // ✅ SI LE RÔLE EST MODIFIÉ, METTRE À JOUR AUSSI L'UTILISATEUR
      if (updateData.role && updateData.role !== employee.role) {
        const user = await User.findByIdAndUpdate(
          employee.userId,
          { role: updateData.role },
          { new: true }
        );
        console.log('✅ Rôle utilisateur mis à jour:', user.role);
      }

      // Mettre à jour l'employé
      Object.assign(employee, updateData);
      await employee.save();

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Supprimer un employé
  static async deleteEmployee(employeeId) {
    try {
      // Vérifier que l'employé n'a pas de tâches assignées
      const tasksAssignees = await Task.countDocuments({
        assigneId: employeeId,
        status: { $ne: 'Terminée' }
      });

      if (tasksAssignees > 0) {
        throw new Error(
          'Impossible de supprimer : employé a des tâches assignées'
        );
      }

      const employee = await Employee.findByIdAndDelete(employeeId);

      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      return { message: 'Employé supprimé avec succès' };
    } catch (error) {
      throw error;
    }
  }

  // Changer le statut d'un employé
  static async updateEmployeeStatus(employeeId, status) {
    try {
      const validStatus = ['Actif', 'Inactif', 'Congé'];

      if (!validStatus.includes(status)) {
        throw new Error('Statut invalide');
      }

      const employee = await Employee.findByIdAndUpdate(
        employeeId,
        { status, updatedAt: Date.now() },
        { new: true }
      );

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les tâches assignées à un employé
  static async getEmployeeTasks(employeeId, status = null) {
    try {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      const query = { assigneId: employeeId };

      if (status) {
        query.status = status;
      }

      const tasks = await Task.find(query)
        .populate('projectId', 'titre')
        .sort({ priorite: -1, dateEcheance: 1 });

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les projets assignés à un employé
  static async getEmployeeProjects(employeeId) {
    try {
      const employee = await Employee.findById(employeeId)
        .populate('projectsAssignes');

      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      return employee.projectsAssignes;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir les statistiques d'un employé
  static async getEmployeeStats(employeeId) {
    try {
      const employee = await Employee.findById(employeeId);

      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      // Tâches totales assignées
      const tachesTotales = await Task.countDocuments({
        assigneId: employeeId
      });

      // Tâches terminées
      const tachesTerminees = await Task.countDocuments({
        assigneId: employeeId,
        status: 'Terminée'
      });

      // Tâches en cours
      const tachesEnCours = await Task.countDocuments({
        assigneId: employeeId,
        status: 'En cours'
      });

      // Tâches en retard
      const now = new Date();
      const tachesEnRetard = await Task.countDocuments({
        assigneId: employeeId,
        status: { $ne: 'Terminée' },
        dateEcheance: { $lt: now }
      });

      // Tâches par priorité
      const tachesParPriorite = {
        Basse: await Task.countDocuments({
          assigneId: employeeId,
          priorite: 'Basse'
        }),
        Moyenne: await Task.countDocuments({
          assigneId: employeeId,
          priorite: 'Moyenne'
        }),
        Haute: await Task.countDocuments({
          assigneId: employeeId,
          priorite: 'Haute'
        }),
        Critique: await Task.countDocuments({
          assigneId: employeeId,
          priorite: 'Critique'
        })
      };

      // Projets assignés
      const nombreProjets = employee.projectsAssignes.length;

      // Taux de complétion
      const tauxCompletion = tachesTotales > 0 
        ? ((tachesTerminees / tachesTotales) * 100).toFixed(2)
        : 0;

      return {
        nomEmploye: employee.nom,
        poste: employee.poste,
        role: employee.role,
        status: employee.status,
        tachesTotales,
        tachesTerminees,
        tachesEnCours,
        tachesEnRetard,
        tauxCompletion,
        nombreProjets,
        tachesParPriorite
      };
    } catch (error) {
      throw error;
    }
  }

  // Assigner une tâche à un employé
  static async assignTaskToEmployee(employeeId, taskId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Tâche non trouvée');
      }

      task.assigneId = employeeId;
      await task.save();

      return task;
    } catch (error) {
      throw error;
    }
  }

  // Assigner un projet à un employé
  static async assignProjectToEmployee(employeeId, projectId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Projet non trouvé');
      }

      // Vérifier que le projet n'est pas déjà assigné
      if (!employee.projectsAssignes.includes(projectId)) {
        employee.projectsAssignes.push(projectId);
        await employee.save();
      }

      return employee;
    } catch (error) {
      throw error;
    }
  }

  // Retirer une tâche d'un employé
  static async unassignTaskFromEmployee(employeeId, taskId) {
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

  // Retirer un projet d'un employé
  static async unassignProjectFromEmployee(employeeId, projectId) {
    try {
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employé non trouvé');
      }

      employee.projectsAssignes = employee.projectsAssignes.filter(
        id => id.toString() !== projectId
      );
      await employee.save();

      return employee;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = EmployeeService;