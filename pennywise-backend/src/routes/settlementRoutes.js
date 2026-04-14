const express = require('express');
const router = express.Router({ mergeParams: true }); // Merge params to get groupId from parent router if needed
const settlementController = require('../controllers/settlementController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/', authenticateToken, settlementController.getOptimalSettlements);
router.post('/payments', authenticateToken, settlementController.recordPayment);

module.exports = router;
