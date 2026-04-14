const express = require('express');
const router = express.Router();
const advancedFeaturesController = require('../controllers/advancedFeaturesController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/goals', authenticateToken, advancedFeaturesController.createGoal);
router.get('/goals', authenticateToken, advancedFeaturesController.getGoals);
router.patch('/goals/:id', authenticateToken, advancedFeaturesController.updateGoalProgress);

router.get('/subscriptions', authenticateToken, advancedFeaturesController.getSubscriptions);
router.post('/subscriptions/:id/confirm', authenticateToken, advancedFeaturesController.confirmSubscription);

module.exports = router;
