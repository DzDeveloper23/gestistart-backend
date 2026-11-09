const express = require('express');
const ProjectsController = require('../controllers/projects.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

// ===== MIDDLEWARE : Tous les routes nécessitent authentification =====
router.use(authMiddleware);

// ===== ROUTES =====

// GET - Tous les utilisateurs authentifiés
router.get('/', ProjectsController.getAllProjects);
router.get('/:id', ProjectsController.getProjectById);
router.get('/:id/stats', ProjectsController.getProjectStats);

// POST - Admin et Manager seulement
router.post('/', roleMiddleware('Admin', 'Manager'), ProjectsController.createProject);

// PUT - Admin et Manager seulement
router.put('/:id', roleMiddleware('Admin', 'Manager'), ProjectsController.updateProject);

// PATCH - Changer le statut - Admin et Manager seulement ✅ NOUVEAU
router.patch('/:id/status', roleMiddleware('Admin', 'Manager'), ProjectsController.updateProjectStatus);

// DELETE - Admin seulement
router.delete('/:id', roleMiddleware('Admin'), ProjectsController.deleteProject);

// ===== GESTION DE L'ÉQUIPE - Admin et Manager =====
router.post('/:id/team', roleMiddleware('Admin', 'Manager'), ProjectsController.assignTeam);
router.post('/:id/team/:employeeId', roleMiddleware('Admin', 'Manager'), ProjectsController.addTeamMember);
router.delete('/:id/team/:employeeId', roleMiddleware('Admin', 'Manager'), ProjectsController.removeTeamMember);

module.exports = router;