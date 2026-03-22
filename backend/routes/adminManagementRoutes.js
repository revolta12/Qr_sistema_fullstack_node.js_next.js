const express = require('express');
const AdminManagementController = require('../controllers/adminManagementController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', AdminManagementController.getAllAdmins);
router.get('/profile', AdminManagementController.getAdminProfile);
router.post('/', AdminManagementController.createAdmin);
router.put('/:id', AdminManagementController.updateAdmin);
router.delete('/:id', AdminManagementController.deleteAdmin);

module.exports = router;