const express = require('express');
const EmployeesController = require('../controllers/employees.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

router.use(authMiddleware);

// ============ GET (LECTURE) - Admin, Manager, Employee ============
router.get('/', roleMiddleware('Admin', 'Manager', 'Employee'), EmployeesController.getAllEmployees);
router.get('/:id', roleMiddleware('Admin', 'Manager', 'Employee'), EmployeesController.getEmployeeById);
router.get('/:id/tasks', roleMiddleware('Admin', 'Manager', 'Employee'), EmployeesController.getEmployeeTasks);
router.get('/:id/projects', roleMiddleware('Admin', 'Manager', 'Employee'), EmployeesController.getEmployeeProjects);
router.get('/:id/stats', roleMiddleware('Admin', 'Manager', 'Employee'), EmployeesController.getEmployeeStats);

// ============ POST (CRÉATION) - Admin et Manager seulement ============
router.post('/', roleMiddleware('Admin', 'Manager'), EmployeesController.createEmployee);
router.post('/:id/projects/:projectId', roleMiddleware('Admin', 'Manager'), EmployeesController.assignProjectToEmployee);

// ============ PUT (MODIFICATION) - Admin et Manager seulement ============
router.put('/:id', roleMiddleware('Admin', 'Manager'), EmployeesController.updateEmployee);

// ============ DELETE (SUPPRESSION) - Admin seulement ============
router.delete('/:id', roleMiddleware('Admin'), EmployeesController.deleteEmployee);
router.delete('/:id/projects/:projectId', roleMiddleware('Admin'), EmployeesController.unassignProjectFromEmployee);

// ============ PATCH (CHANGEMENT DE STATUT) - Admin et Manager seulement ============
router.patch('/:id/status', roleMiddleware('Admin', 'Manager'), EmployeesController.updateEmployeeStatus);

module.exports = router;