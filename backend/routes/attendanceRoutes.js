const express = require('express');
const AttendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes for QR scanning - TIDAK PAKAI AUTH
router.post('/record', AttendanceController.recordAttendance);

// Protected routes - PAKAI AUTH
router.use(authenticateToken);

router.get('/', AttendanceController.getAttendanceByDateRange);
router.get('/monthly-summary', AttendanceController.getMonthlySummary);
router.post('/manual', AttendanceController.manualEntry);


router.post('/manual/special', AttendanceController.createManualAttendance);
router.post('/manual/bulk', AttendanceController.createBulkManualAttendance);

module.exports = router;