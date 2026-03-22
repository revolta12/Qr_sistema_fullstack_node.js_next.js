const express = require('express');
const AdminController = require('../controllers/adminController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/login', AdminController.login);

// Protected routes
router.get('/profile', authenticateToken, AdminController.getProfile);
router.put('/change-password', authenticateToken, AdminController.changePassword);
router.get('/dashboard-stats', authenticateToken, AdminController.getDashboardStats);

module.exports = router;