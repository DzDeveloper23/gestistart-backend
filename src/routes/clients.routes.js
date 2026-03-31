const express = require('express');
const ClientsController = require('../controllers/clients.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware'); // ✅ Importer

const router = express.Router();

router.use(authMiddleware);

// GET - Admin et Manager seulement
router.get('/', roleMiddleware('Admin', 'Manager'), ClientsController.getAllClients);
router.get('/:id', roleMiddleware('Admin', 'Manager'), ClientsController.getClientById);
router.get('/:id/projects', roleMiddleware('Admin', 'Manager'), ClientsController.getClientProjects);
router.get('/:id/stats', roleMiddleware('Admin', 'Manager'), ClientsController.getClientStats);

// POST - Admin et Manager seulement
router.post('/', roleMiddleware('Admin', 'Manager'), ClientsController.createClient);

// PUT - Admin et Manager seulement
router.put('/:id', roleMiddleware('Admin', 'Manager'), ClientsController.updateClient);

// DELETE - Admin seulement ✅
router.delete('/:id', roleMiddleware('Admin'), ClientsController.deleteClient);

// PATCH - Admin et Manager
router.patch('/:id/status', roleMiddleware('Admin', 'Manager'), ClientsController.updateClientStatus);

module.exports = router;