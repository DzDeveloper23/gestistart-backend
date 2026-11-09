const Project = require('../models/Project');
const Task = require('../models/Task');
const Client = require('../models/Client');
const Employee = require('../models/Employee');

class DashboardService {
  // Obtenir tous les KPIs du dashboard
  static async getDashboardKPIs() {
    try {
      // ===== PROJETS =====
      const totalProjets = await Project.countDocuments();
      const projetsEnCours = await Project.countDocuments({ status: 'En cours' });
      const projetsTermines = await Project.countDocuments({ status: 'Terminé' });
      const projetsSuspendus = await Project.countDocuments({ status: 'Suspendu' });
      const projetsEnAttente = await Project.countDocuments({ status: 'En attente' });

      // ===== TÂCHES =====
      const totalTaches = await Task.countDocuments();
      const tachesAFaire = await Task.countDocuments({ status: 'À faire' });
      const tachesEnCours = await Task.countDocuments({ status: 'En cours' });
      const tachesEnRevision = await Task.countDocuments({ status: 'En révision' });
      const tachesTerminees = await Task.countDocuments({ status: 'Terminée' });

      // Tâches en retard
      const now = new Date();
      const tachesEnRetard = await Task.countDocuments({
        dateEcheance: { $lt: now },
        status: { $ne: 'Terminée' }
      });

      // ===== CLIENTS =====
      const totalClients = await Client.countDocuments();
      const clientsActifs = await Client.countDocuments({ status: 'Actif' });
      const clientsProspects = await Client.countDocuments({ status: 'Prospect' });

      // ===== EMPLOYÉS =====
      const totalEmployes = await Employee.countDocuments();
      const employesActifs = await Employee.countDocuments({ status: 'Actif' });
      const employesEnConge = await Employee.countDocuments({ status: 'Congé' });

      // ===== BUDGETS =====
      const projects = await Project.find();
      const budgetTotal = projects.reduce((sum, p) => sum + p.budget, 0);
      const budgetUtilise = projects.reduce(
        (sum, p) => sum + p.montantUtilise,
        0
      );
      const budgetPercent = budgetTotal > 0 
        ? ((budgetUtilise / budgetTotal) * 100).toFixed(2)
        : 0;

      // ===== TAUX DE COMPLÉTION =====
      const tauxCompletion = totalTaches > 0 
        ? ((tachesTerminees / totalTaches) * 100).toFixed(2)
        : 0;

      return {
        projets: {
          total: totalProjets,
          enCours: projetsEnCours,
          termines: projetsTermines,
          suspendus: projetsSuspendus,
          enAttente: projetsEnAttente
        },
        taches: {
          total: totalTaches,
          aFaire: tachesAFaire,
          enCours: tachesEnCours,
          enRevision: tachesEnRevision,
          terminees: tachesTerminees,
          enRetard: tachesEnRetard
        },
        clients: {
          total: totalClients,
          actifs: clientsActifs,
          prospects: clientsProspects
        },
        employes: {
          total: totalEmployes,
          actifs: employesActifs,
          enConge: employesEnConge
        },
        budget: {
          total: budgetTotal,
          utilise: budgetUtilise,
          restant: budgetTotal - budgetUtilise,
          percent: budgetPercent
        },
        tauxCompletion
      };
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les projets récents
  static async getRecentProjects(limit = 5) {
    try {
      const projects = await Project.find()
        .populate('clientId', 'nomEntreprise')
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('titre status budget montantUtilise dateDebut dateFin priorite');

      return projects;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les tâches urgentes
  static async getUrgentTasks(limit = 10) {
    try {
      const tasks = await Task.find({
        status: { $ne: 'Terminée' },
        priorite: { $in: ['Haute', 'Critique'] }
      })
        .populate('projectId', 'titre')
        .populate('assigneId', 'nom email')
        .sort({ priorite: -1, dateEcheance: 1 })
        .limit(limit)
        .select('titre status priorite dateEcheance assigneId projectId');

      return tasks;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les tâches par priorité
  static async getTasksByPriority() {
    try {
      const tasks = await Task.find();

      const byPriority = {
        Basse: tasks.filter(t => t.priorite === 'Basse').length,
        Moyenne: tasks.filter(t => t.priorite === 'Moyenne').length,
        Haute: tasks.filter(t => t.priorite === 'Haute').length,
        Critique: tasks.filter(t => t.priorite === 'Critique').length
      };

      return byPriority;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les tâches par statut
  static async getTasksByStatus() {
    try {
      const tasks = await Task.find();

      const byStatus = {
        'À faire': tasks.filter(t => t.status === 'À faire').length,
        'En cours': tasks.filter(t => t.status === 'En cours').length,
        'En révision': tasks.filter(t => t.status === 'En révision').length,
        'Terminée': tasks.filter(t => t.status === 'Terminée').length
      };

      return byStatus;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les projets par statut
  static async getProjectsByStatus() {
    try {
      const projects = await Project.find();

      const byStatus = {
        'En cours': projects.filter(p => p.status === 'En cours').length,
        'En attente': projects.filter(p => p.status === 'En attente').length,
        'Terminé': projects.filter(p => p.status === 'Terminé').length,
        'Suspendu': projects.filter(p => p.status === 'Suspendu').length
      };

      return byStatus;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer l'activité par jour (derniers 7 jours)
  static async getActivityChart() {
    try {
      const last7Days = [];
      const today = new Date();

      // Créer les 7 derniers jours
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        // Compter les tâches créées ce jour
        const tasksCreated = await Task.countDocuments({
          createdAt: { $gte: date, $lt: nextDate }
        });

        // Compter les tâches terminées ce jour
        const tasksCompleted = await Task.countDocuments({
          updatedAt: { $gte: date, $lt: nextDate },
          status: 'Terminée'
        });

        last7Days.push({
          date: date.toISOString().split('T')[0],
          tasksCreated,
          tasksCompleted
        });
      }

      return last7Days;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les employés par charge de travail
  static async getEmployeeWorkload() {
    try {
      const employees = await Employee.find({ status: 'Actif' });

      const workload = [];

      for (const emp of employees) {
        const tasks = await Task.countDocuments({
          assigneId: emp._id,
          status: { $ne: 'Terminée' }
        });

        workload.push({
          id: emp._id,
          nom: emp.nom,
          poste: emp.poste,
          tasksCount: tasks
        });
      }

      // Trier par nombre de tâches (décroissant)
      workload.sort((a, b) => b.tasksCount - a.tasksCount);

      return workload;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les clients avec le plus de projets
  static async getTopClients(limit = 5) {
    try {
      const clients = await Client.find({ status: 'Actif' });

      const topClients = [];

      for (const client of clients) {
        const projects = await Project.countDocuments({ clientId: client._id });
        const budget = await Project.aggregate([
          { $match: { clientId: client._id } },
          { $group: { _id: null, total: { $sum: '$budget' } } }
        ]);

        topClients.push({
          id: client._id,
          nomEntreprise: client.nomEntreprise,
          projectsCount: projects,
          budgetTotal: budget[0]?.total || 0
        });
      }

      // Trier par nombre de projets
      topClients.sort((a, b) => b.projectsCount - a.projectsCount);

      return topClients.slice(0, limit);
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les projets à risque (budget dépassé)
  static async getRiskProjects() {
    try {
      const projects = await Project.find({
        status: { $ne: 'Terminé' }
      })
        .populate('clientId', 'nomEntreprise')
        .select(
          'titre budget montantUtilise status dateDebut dateFin priorite'
        );

      const riskProjects = projects
        .filter(p => p.montantUtilise > p.budget * 0.8) // Plus de 80% du budget
        .map(p => ({
          ...p.toObject(),
          budgetPercent: ((p.montantUtilise / p.budget) * 100).toFixed(2),
          isOverBudget: p.montantUtilise > p.budget
        }));

      return riskProjects;
    } catch (error) {
      throw error;
    }
  }

  // Récupérer les projets en retard
  static async getOverdueProjects() {
    try {
      const now = new Date();

      const projects = await Project.find({
        status: { $ne: 'Terminé' },
        dateFin: { $lt: now }
      })
        .populate('clientId', 'nomEntreprise')
        .select('titre status dateDebut dateFin budget priorite');

      return projects;
    } catch (error) {
      throw error;
    }
  }

  // Obtenir le dashboard complet (tous les données)
  static async getFullDashboard() {
    try {
      const kpis = await this.getDashboardKPIs();
      const recentProjects = await this.getRecentProjects(5);
      const urgentTasks = await this.getUrgentTasks(10);
      const tasksByPriority = await this.getTasksByPriority();
      const tasksByStatus = await this.getTasksByStatus();
      const projectsByStatus = await this.getProjectsByStatus();
      const activityChart = await this.getActivityChart();
      const employeeWorkload = await this.getEmployeeWorkload();
      const topClients = await this.getTopClients(5);
      const riskProjects = await this.getRiskProjects();
      const overdueProjects = await this.getOverdueProjects();

      return {
        kpis,
        recentProjects,
        urgentTasks,
        charts: {
          tasksByPriority,
          tasksByStatus,
          projectsByStatus,
          activityChart,
          employeeWorkload,
          topClients
        },
        alerts: {
          riskProjects,
          overdueProjects
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = DashboardService;