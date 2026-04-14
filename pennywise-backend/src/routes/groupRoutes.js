const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/', authenticateToken, groupController.createGroup);
router.get('/:groupId/feed', authenticateToken, groupController.getActivityFeed);
router.get('/:groupId/insights', authenticateToken, groupController.getInsights);

module.exports = router;
