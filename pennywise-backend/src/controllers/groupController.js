const groupService = require('../services/groupService');

class GroupController {
    async createGroup(req, res) {
        try {
            const { name, creatorId } = req.body;
            const result = await groupService.createGroup(name, creatorId);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating group:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getActivityFeed(req, res) {
        try {
            const { groupId } = req.params;
            const limit = parseInt(req.query.limit) || 50;
            const feed = await groupService.getActivityFeed(groupId, limit);
            res.status(200).json({ success: true, data: feed });
        } catch (error) {
            console.error('Error fetching activity feed:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getInsights(req, res) {
        try {
            const { groupId } = req.params;
            const insights = await groupService.getGroupInsights(groupId);
            res.status(200).json({ success: true, data: insights });
        } catch (error) {
            console.error('Error fetching insights:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new GroupController();
