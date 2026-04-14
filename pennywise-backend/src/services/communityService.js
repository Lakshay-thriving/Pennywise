const db = require('../db');

class CommunityService {
    async createArticle(title, content, tags, media, authorId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            // Insert Article
            const articleRes = await client.query(
                'INSERT INTO articles (title, content, author_id) VALUES ($1, $2, $3) RETURNING id, created_at',
                [title, content, authorId]
            );
            const articleId = articleRes.rows[0].id;
            const createdAt = articleRes.rows[0].created_at;

            // Insert Tags
            if (tags && tags.length > 0) {
                for (const tag of tags) {
                    const cleanTag = tag.trim().toLowerCase();
                    // Upsert tag
                    let tagRes = await client.query('SELECT id FROM tags WHERE name = $1', [cleanTag]);
                    let tagId;
                    if (tagRes.rowCount === 0) {
                        const newTag = await client.query('INSERT INTO tags (name) VALUES ($1) RETURNING id', [cleanTag]);
                        tagId = newTag.rows[0].id;
                    } else {
                        tagId = tagRes.rows[0].id;
                    }
                    // Map to article
                    await client.query('INSERT INTO article_tags (article_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [articleId, tagId]);
                }
            }

            // Insert Media
            if (media && media.length > 0) {
                for (const file of media) {
                    await client.query(
                        'INSERT INTO article_media (article_id, file_url, file_type) VALUES ($1, $2, $3)',
                        [articleId, file.url, file.type]
                    );
                }
            }

            await client.query('COMMIT');
            return { id: articleId, title, content, authorId, created_at: createdAt };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async getArticles(page = 1, limit = 10, filterTag = null) {
        const client = await db.getClient();
        try {
            const offset = (page - 1) * limit;
            let query = `
                SELECT 
                    a.id, a.title, a.content, a.created_at,
                    u.name as author_name,
                    COUNT(DISTINCT l.id) as likes_count,
                    COUNT(DISTINCT c.id) as comments_count
                FROM articles a
                JOIN users u ON a.author_id = u.id
                LEFT JOIN likes l ON a.id = l.article_id
                LEFT JOIN article_comments c ON a.id = c.article_id
            `;
            const queryParams = [];

            if (filterTag) {
                query += `
                    JOIN article_tags at ON a.id = at.article_id
                    JOIN tags t ON at.tag_id = t.id
                    WHERE t.name = $1
                `;
                queryParams.push(filterTag.toLowerCase());
            }

            query += `
                GROUP BY a.id, u.name
                ORDER BY a.created_at DESC
                LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
            `;
            queryParams.push(limit, offset);

            const res = await client.query(query, queryParams);
            return res.rows;
        } finally {
            client.release();
        }
    }

    async getArticleById(articleId) {
        const client = await db.getClient();
        try {
            const articleRes = await client.query(`
                SELECT a.*, u.name as author_name 
                FROM articles a JOIN users u ON a.author_id = u.id 
                WHERE a.id = $1
            `, [articleId]);

            if (articleRes.rowCount === 0) throw new Error("Article not found");
            const article = articleRes.rows[0];

            const mediaRes = await client.query('SELECT file_url, file_type FROM article_media WHERE article_id = $1', [articleId]);
            const tagsRes = await client.query('SELECT t.name FROM tags t JOIN article_tags at ON t.id = at.tag_id WHERE at.article_id = $1', [articleId]);
            const commentsRes = await client.query(`
                SELECT c.id, c.text, c.timestamp, u.name as author_name, c.parent_id
                FROM article_comments c JOIN users u ON c.user_id = u.id
                WHERE c.article_id = $1
                ORDER BY c.timestamp ASC
            `, [articleId]);

            article.media = mediaRes.rows;
            article.tags = tagsRes.rows.map(r => r.name);
            article.comments = commentsRes.rows;

            return article;
        } finally {
            client.release();
        }
    }

    async likeArticle(articleId, userId) {
        const client = await db.getClient();
        try {
            await client.query('INSERT INTO likes (article_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [articleId, userId]);
            return { success: true };
        } finally {
            client.release();
        }
    }

    async createComment(articleId, userId, text, parentId = null) {
        const client = await db.getClient();
        try {
            const res = await client.query(
                'INSERT INTO article_comments (article_id, user_id, text, parent_id) VALUES ($1, $2, $3, $4) RETURNING id, timestamp',
                [articleId, userId, text, parentId]
            );
            return res.rows[0];
        } finally {
            client.release();
        }
    }
}

module.exports = new CommunityService();
