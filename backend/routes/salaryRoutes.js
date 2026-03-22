const express = require('express');
const SalaryController = require('../controllers/salaryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/calculate', SalaryController.calculateSalary);
router.post('/calculate-all', SalaryController.calculateAllSalaries);
router.get('/', SalaryController.getSalaries);
router.get('/:id', SalaryController.getSalaryById);
router.post('/:id/status', SalaryController.updateSalaryStatus);


module.exports = router;