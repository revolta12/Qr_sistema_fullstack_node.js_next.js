const express = require('express');
const EmailConfigController = require('../controllers/emailConfigController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', EmailConfigController.getEmailConfig);
router.put('/', EmailConfigController.updateEmailConfig);
router.post('/test', EmailConfigController.testEmailConfig);

module.exports = router;