const communityService = require('../services/communityService');

class CommunityController {
    async createArticle(req, res) {
        try {
            const { title, content, tags, media } = req.body;
            // req.user.id is populated by authenticateToken middleware
            const authorId = req.user?.id || 1; // fallback to 1 if testing without token

            const article = await communityService.createArticle(title, content, tags, media, authorId);
            res.status(201).json({ success: true, data: article });
        } catch (error) {
            console.error('Error creating article:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getArticles(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const tag = req.query.tag || null;

            const articles = await communityService.getArticles(page, limit, tag);
            res.status(200).json({ success: true, data: articles });
        } catch (error) {
            console.error('Error fetching articles:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getArticle(req, res) {
        try {
            const article = await communityService.getArticleById(req.params.id);
            res.status(200).json({ success: true, data: article });
        } catch (error) {
            console.error('Error fetching article:', error);
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async likeArticle(req, res) {
        try {
            const userId = req.user?.id || 1;
            await communityService.likeArticle(req.params.id, userId);
            res.status(200).json({ success: true, message: 'Article liked' });
        } catch (error) {
            console.error('Error liking article:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async postComment(req, res) {
        try {
            const userId = req.user?.id || 1;
            const { text, parentId } = req.body;
            const comment = await communityService.createComment(req.params.id, userId, text, parentId);
            res.status(201).json({ success: true, data: comment });
        } catch (error) {
            console.error('Error posting comment:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new CommunityController();
