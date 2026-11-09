const EmployeeService = require('../services/employee.service');
const NotificationService = require('../services/notification.service');
const User = require('../models/User');

class EmployeeController {
  // POST /api/employees - Créer un nouvel employé
  static async createEmployee(req, res) {
    try {
      const { userId, poste, role, salaire, dateEmbauche } = req.body;

      // ✅ VALIDATIONS
      console.log('📝 Données reçues:', { userId, poste, role, salaire, dateEmbauche });

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId est obligatoire'
        });
      }

      if (!poste) {
        return res.status(400).json({
          success: false,
          message: 'Poste est obligatoire'
        });
      }

      if (!dateEmbauche) {
        return res.status(400).json({
          success: false,
          message: 'Date d\'embauche est obligatoire'
        });
      }

      // ✅ Vérifier que userId est un ObjectId valide
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'userId invalide'
        });
      }

      console.log('✅ Validations OK, appel au service...');

      // ✅ CRÉER L'EMPLOYÉ
      const employeeData = {
        userId,
        poste,
        role: role || 'Employé',
        salaire: salaire || 0,
        dateEmbauche
      };

      console.log('🔍 DEBUG - Appel createEmployee avec:', employeeData);

      const newEmployee = await EmployeeService.createEmployee(employeeData);

      console.log('✅ Employé créé:', newEmployee._id);

      // ✅ RÉCUPÉRER LE NOM DE L'UTILISATEUR
      const user = await User.findById(userId);
      const userName = user?.nom || 'Utilisateur';

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Nouvel employé créé',
        `${userName} a été ajouté en tant qu'employé (${poste})`,
        'success',
        newEmployee._id,
        'employee'
      );

      // ✅ NOTIFIER AUSSI LE NOUVEL EMPLOYÉ
      await NotificationService.createNotification(
        userId,
        'Bienvenue !',
        `Vous avez été ajouté en tant que ${poste}`,
        'success',
        newEmployee._id,
        'employee'
      );

      // ✅ RÉPONSE RÉUSSIE
      return res.status(201).json({
        success: true,
        message: 'Employé créé avec succès',
        employee: newEmployee
      });

    } catch (error) {
      console.error('❌ ERREUR createEmployee:', error.message);
      
      return res.status(400).json({
        success: false,
        message: error.message || 'Erreur lors de la création'
      });
    }
  }

  // GET /api/employees - Récupérer tous les employés
  static async getAllEmployees(req, res) {
    try {
      const { status, role, search, page = 1, limit = 9 } = req.query;

      const filters = {};
      if (status) filters.status = status;
      if (role) filters.role = role;
      if (search) filters.search = search;

      const result = await EmployeeService.getAllEmployees(
        filters,
        parseInt(page),
        parseInt(limit)
      );

      return res.status(200).json({
        success: true,
        data: result.employees,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('❌ Erreur getAllEmployees:', error.message);
      
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/employees/:id - Récupérer un employé par ID
  static async getEmployeeById(req, res) {
    try {
      const { id } = req.params; // ✅ CHANGÉ de employeeId à id
      
      const result = await EmployeeService.getEmployeeById(id);
      
      return res.status(200).json({
        success: true,
        employee: result.employee,
        tasks: result.tasks
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PUT /api/employees/:id - Mettre à jour un employé
  static async updateEmployee(req, res) {
    try {
      const { id } = req.params; // ✅ CHANGÉ de employeeId à id
      const updateData = req.body;

      console.log('🔍 UPDATE - ID reçu:', id);
      console.log('🔍 UPDATE - Data reçue:', updateData);

      const updatedEmployee = await EmployeeService.updateEmployee(
        id,
        updateData
      );

      console.log('✅ UPDATE - Employé mis à jour:', updatedEmployee._id);

      // ✅ CRÉER UNE NOTIFICATION
      const user = await User.findById(updatedEmployee.userId);
      const userName = user?.nom || 'Utilisateur';

      await NotificationService.createNotification(
        req.user.userId,
        'Employé mis à jour',
        `Les informations de ${userName} ont été modifiées`,
        'info',
        updatedEmployee._id,
        'employee'
      );

      return res.status(200).json({
        success: true,
        message: 'Employé mis à jour',
        employee: updatedEmployee
      });
    } catch (error) {
      console.error('❌ UPDATE ERROR:', error);
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/employees/:id - Supprimer un employé
  static async deleteEmployee(req, res) {
    try {
      const { id } = req.params; // ✅ CHANGÉ de employeeId à id

      // Récupérer l'employé avant suppression
      const Employee = require('../models/Employee');
      const employee = await Employee.findById(id);
      const user = await User.findById(employee?.userId);
      const userName = user?.nom || 'Utilisateur';

      await EmployeeService.deleteEmployee(id);

      // ✅ CRÉER UNE NOTIFICATION
      await NotificationService.createNotification(
        req.user.userId,
        'Employé supprimé',
        `${userName} a été retiré de la liste des employés`,
        'warning',
        null,
        'employee'
      );

      return res.status(200).json({
        success: true,
        message: 'Employé supprimé avec succès'
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/employees/:id/status - Changer le statut
  static async updateEmployeeStatus(req, res) {
    try {
      const { id } = req.params; // ✅ CHANGÉ de employeeId à id
      const { status } = req.body;

      const employee = await EmployeeService.updateEmployeeStatus(
        id,
        status
      );

      // ✅ CRÉER UNE NOTIFICATION
      const user = await User.findById(employee.userId);
      const userName = user?.nom || 'Utilisateur';

      await NotificationService.createNotification(
        req.user.userId,
        'Statut de l\'employé changé',
        `Le statut de ${userName} est maintenant ${status}`,
        'info',
        employee._id,
        'employee'
      );

      return res.status(200).json({
        success: true,
        employee
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/employees/:id/stats - Obtenir les statistiques
  static async getEmployeeStats(req, res) {
    try {
      const { id } = req.params; // ✅ CHANGÉ de employeeId à id

      const stats = await EmployeeService.getEmployeeStats(id);

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

  // GET /api/employees/:id/tasks - Obtenir les tâches d'un employé
  static async getEmployeeTasks(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const tasks = await EmployeeService.getEmployeeTasks(id, status);

      return res.status(200).json({
        success: true,
        tasks
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/employees/:id/projects - Obtenir les projets d'un employé
  static async getEmployeeProjects(req, res) {
    try {
      const { id } = req.params;

      const projects = await EmployeeService.getEmployeeProjects(id);

      return res.status(200).json({
        success: true,
        projects
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // POST /api/employees/:id/projects/:projectId - Assigner un projet à un employé
  static async assignProjectToEmployee(req, res) {
    try {
      const { id, projectId } = req.params;

      const employee = await EmployeeService.assignProjectToEmployee(id, projectId);

      return res.status(200).json({
        success: true,
        message: 'Projet assigné',
        employee
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // DELETE /api/employees/:id/projects/:projectId - Retirer un projet d'un employé
  static async unassignProjectFromEmployee(req, res) {
    try {
      const { id, projectId } = req.params;

      const employee = await EmployeeService.unassignProjectFromEmployee(id, projectId);

      return res.status(200).json({
        success: true,
        message: 'Projet retiré',
        employee
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = EmployeeController;