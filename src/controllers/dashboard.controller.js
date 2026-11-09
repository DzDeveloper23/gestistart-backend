const DashboardService = require('../services/dashboard.service');

class DashboardController {
  // GET /api/dashboard/kpis - KPIs principaux
  static async getKPIs(req, res) {
    try {
      const kpis = await DashboardService.getDashboardKPIs();

      return res.status(200).json({
        success: true,
        kpis
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/recent-projects - Projets récents
  static async getRecentProjects(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const projects = await DashboardService.getRecentProjects(limit);

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

  // GET /api/dashboard/urgent-tasks - Tâches urgentes
  static async getUrgentTasks(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const tasks = await DashboardService.getUrgentTasks(limit);

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

  // GET /api/dashboard/charts/tasks-priority - Graphique tâches par priorité
  static async getTasksByPriority(req, res) {
    try {
      const data = await DashboardService.getTasksByPriority();

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/charts/tasks-status - Graphique tâches par statut
  static async getTasksByStatus(req, res) {
    try {
      const data = await DashboardService.getTasksByStatus();

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/charts/projects-status - Graphique projets par statut
  static async getProjectsByStatus(req, res) {
    try {
      const data = await DashboardService.getProjectsByStatus();

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/charts/activity - Graphique activité
  static async getActivityChart(req, res) {
    try {
      const data = await DashboardService.getActivityChart();

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/charts/employee-workload - Charge de travail employés
  static async getEmployeeWorkload(req, res) {
    try {
      const data = await DashboardService.getEmployeeWorkload();

      return res.status(200).json({
        success: true,
        data
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/top-clients - Top clients
  static async getTopClients(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 5;

      const clients = await DashboardService.getTopClients(limit);

      return res.status(200).json({
        success: true,
        clients
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/alerts/risk-projects - Projets à risque
  static async getRiskProjects(req, res) {
    try {
      const projects = await DashboardService.getRiskProjects();

      return res.status(200).json({
        success: true,
        projects,
        count: projects.length
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/alerts/overdue-projects - Projets en retard
  static async getOverdueProjects(req, res) {
    try {
      const projects = await DashboardService.getOverdueProjects();

      return res.status(200).json({
        success: true,
        projects,
        count: projects.length
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // GET /api/dashboard/full - Dashboard complet
  static async getFullDashboard(req, res) {
    try {
      const dashboard = await DashboardService.getFullDashboard();

      return res.status(200).json({
        success: true,
        dashboard
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = DashboardController;