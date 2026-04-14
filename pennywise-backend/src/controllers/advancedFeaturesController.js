const advancedFeaturesService = require('../services/advancedFeaturesService');

class AdvancedFeaturesController {
    
    async createGoal(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { title, target_amount, current_amount, deadline } = req.body;
            const goal = await advancedFeaturesService.createGoal(userId, title, target_amount, current_amount, deadline);
            res.status(201).json({ success: true, data: goal });
        } catch (error) {
            console.error('Error creating goal:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getGoals(req, res) {
        try {
            const userId = req.user?.id || 1;
            const goals = await advancedFeaturesService.getGoals(userId);
            res.status(200).json({ success: true, data: goals });
        } catch (error) {
            console.error('Error fetching goals:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async updateGoalProgress(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { current_amount } = req.body;
            const goal = await advancedFeaturesService.updateGoalProgress(req.params.id, userId, current_amount);
            res.status(200).json({ success: true, data: goal });
        } catch (error) {
            console.error('Error updating goal:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getSubscriptions(req, res) {
        try {
            const userId = req.user?.id || 1;
            const subs = await advancedFeaturesService.getSubscriptions(userId);
            res.status(200).json({ success: true, data: subs });
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async confirmSubscription(req, res) {
        try {
            const userId = req.user?.id || 1;
            const sub = await advancedFeaturesService.confirmSubscription(req.params.id, userId);
            res.status(200).json({ success: true, data: sub });
        } catch (error) {
            console.error('Error confirming subscription:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdvancedFeaturesController();
