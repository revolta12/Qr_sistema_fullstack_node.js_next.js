const express = require('express');
const EmployeeController = require('../controllers/employeeController');
const { authenticateToken } = require('../middleware/auth');
const { validateEmployee, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', EmployeeController.getAllEmployees);
router.get('/:id', EmployeeController.getEmployeeById);
router.post('/', validateEmployee, handleValidationErrors, EmployeeController.createEmployee);
router.put('/:id', validateEmployee, handleValidationErrors, EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);
router.get('/:id/qr-code', EmployeeController.generateQRCode);
router.post('/:id/toggle-status', EmployeeController.toggleStatus);

module.exports = router;