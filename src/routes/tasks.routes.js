const express = require('express');
const TasksController = require('../controllers/tasks.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// ===== MIDDLEWARE : Tous les routes nécessitent authentification =====
router.use(authMiddleware);

// ===== ROUTES PRINCIPALES =====

// GET /api/tasks - Récupérer toutes les tâches
router.get('/', TasksController.getAllTasks);

// POST /api/tasks - Créer une tâche
router.post('/', TasksController.createTask);

// GET /api/tasks/:id - Récupérer une tâche
router.get('/:id', TasksController.getTaskById);

// PUT /api/tasks/:id - Mettre à jour une tâche
router.put('/:id', TasksController.updateTask);

// DELETE /api/tasks/:id - Supprimer une tâche
router.delete('/:id', TasksController.deleteTask);

// ===== STATUT (KANBAN) =====

// PATCH /api/tasks/:id/status - Changer le statut
router.patch('/:id/status', TasksController.updateStatus);

// ===== COMMENTAIRES =====

// POST /api/tasks/:id/comments - Ajouter un commentaire
router.post('/:id/comments', TasksController.addComment);

// DELETE /api/tasks/:id/comments/:commentId - Supprimer commentaire
router.delete('/:id/comments/:commentId', TasksController.deleteComment);

// ===== ASSIGNATION =====

// POST /api/tasks/:id/assign - Assigner une tâche
router.post('/:id/assign', TasksController.assignTask);

// DELETE /api/tasks/:id/assign - Retirer assignation
router.delete('/:id/assign', TasksController.unassignTask);

// ===== PIÈCES JOINTES =====

// POST /api/tasks/:id/attachments - Ajouter fichier
router.post('/:id/attachments', TasksController.addAttachment);

// DELETE /api/tasks/:id/attachments/:attachmentId - Retirer fichier
router.delete('/:id/attachments/:attachmentId', TasksController.removeAttachment);

// ===== VUE KANBAN =====

// GET /api/tasks/project/:projectId/kanban - Vue Kanban
router.get('/project/:projectId/kanban', TasksController.getKanbanView);

// ===== STATISTIQUES =====

// GET /api/tasks/project/:projectId/stats - Stats des tâches
router.get('/project/:projectId/stats', TasksController.getTaskStats);

module.exports = router;