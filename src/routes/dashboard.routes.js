const express = require('express');
const DashboardController = require('../controllers/dashboard.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// ===== MIDDLEWARE : Tous les routes nécessitent authentification =====
router.use(authMiddleware);

// ===== KPIs =====

// GET /api/dashboard/kpis - KPIs principaux
router.get('/kpis', DashboardController.getKPIs);

// ===== DONNÉES PRINCIPALES =====

// GET /api/dashboard/recent-projects - Projets récents
router.get('/recent-projects', DashboardController.getRecentProjects);

// GET /api/dashboard/urgent-tasks - Tâches urgentes
router.get('/urgent-tasks', DashboardController.getUrgentTasks);

// ===== GRAPHIQUES =====

// GET /api/dashboard/charts/tasks-priority - Tâches par priorité
router.get('/charts/tasks-priority', DashboardController.getTasksByPriority);

// GET /api/dashboard/charts/tasks-status - Tâches par statut
router.get('/charts/tasks-status', DashboardController.getTasksByStatus);

// GET /api/dashboard/charts/projects-status - Projets par statut
router.get('/charts/projects-status', DashboardController.getProjectsByStatus);

// GET /api/dashboard/charts/activity - Activité
router.get('/charts/activity', DashboardController.getActivityChart);

// GET /api/dashboard/charts/employee-workload - Charge employés
router.get('/charts/employee-workload', DashboardController.getEmployeeWorkload);

// ===== TOP DONNÉES =====

// GET /api/dashboard/top-clients - Top clients
router.get('/top-clients', DashboardController.getTopClients);

// ===== ALERTES =====

// GET /api/dashboard/alerts/risk-projects - Projets à risque
router.get('/alerts/risk-projects', DashboardController.getRiskProjects);

// GET /api/dashboard/alerts/overdue-projects - Projets en retard
router.get('/alerts/overdue-projects', DashboardController.getOverdueProjects);

// ===== COMPLET =====

// GET /api/dashboard/full - Dashboard complet
router.get('/full', DashboardController.getFullDashboard);

module.exports = router;