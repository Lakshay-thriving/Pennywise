const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/articles', authenticateToken, communityController.createArticle);
router.get('/articles', authenticateToken, communityController.getArticles);
router.get('/articles/:id', authenticateToken, communityController.getArticle);
router.post('/articles/:id/like', authenticateToken, communityController.likeArticle);
router.post('/articles/:id/comment', authenticateToken, communityController.postComment);

module.exports = router;
