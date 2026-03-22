const express = require('express');
const SystemLogsController = require('../controllers/systemLogsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Protected routes - PAKAI AUTH
router.use(authenticateToken);

router.get('/', SystemLogsController.getLogs);
router.delete('/', SystemLogsController.clearLogs);
router.delete('/:id', SystemLogsController.deleteLog);

module.exports = router;