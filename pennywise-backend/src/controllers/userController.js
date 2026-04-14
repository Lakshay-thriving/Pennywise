const db = require('../db');
const bcrypt = require('bcrypt');

class UserController {
    async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const client = await db.getClient();
            try {
                // Fetch basic user profile
                const userRes = await client.query('SELECT name, email, profile_image_url, created_at FROM Users WHERE id = $1', [userId]);
                if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
                
                const user = userRes.rows[0];

                // Fetch aggregations for Account Summary
                const expensesRes = await client.query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM Expenses WHERE creator_id = $1', [userId]);
                const groupsRes = await client.query('SELECT COUNT(*) as count FROM Group_Members WHERE user_id = $1', [userId]);
                
                const stats = {
                    totalExpensesCreated: parseInt(expensesRes.rows[0].count),
                    totalAmountSpent: parseInt(expensesRes.rows[0].total),
                    groupsJoined: parseInt(groupsRes.rows[0].count)
                };

                res.status(200).json({ success: true, data: { user, stats } });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('getProfile error:', error);
            res.status(500).json({ error: 'Server error fetching profile' });
        }
    }

    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            // Name might come from formData
            const { name } = req.body;
            let profile_image_url = req.body.profile_image_url;

            if (req.file) {
                profile_image_url = `http://localhost:5000/uploads/${req.file.filename}`;
            }

            const client = await db.getClient();
            try {
                // We don't allow email edits natively right now to avoid authentication bugs, per spec recommendation
                const query = `
                    UPDATE Users 
                    SET name = COALESCE($1, name), 
                        profile_image_url = COALESCE($2, profile_image_url) 
                    WHERE id = $3 
                    RETURNING name, email, profile_image_url
                `;
                const result = await client.query(query, [name, profile_image_url, userId]);

                res.status(200).json({ success: true, data: result.rows[0] });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('updateProfile error:', error);
            res.status(500).json({ error: 'Server error updating profile' });
        }
    }

    async updatePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Both current and new passwords are required' });
            }

            const client = await db.getClient();
            try {
                // Fetch the hash
                const userRes = await client.query('SELECT password_hash FROM Users WHERE id = $1', [userId]);
                if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

                const hash = userRes.rows[0].password_hash;
                const isMatch = await bcrypt.compare(currentPassword, hash);
                
                if (!isMatch) {
                    return res.status(401).json({ error: 'Incorrect current password' });
                }

                // Generates new hash
                const salt = await bcrypt.genSalt(10);
                const newHash = await bcrypt.hash(newPassword, salt);

                await client.query('UPDATE Users SET password_hash = $1 WHERE id = $2', [newHash, userId]);

                res.status(200).json({ success: true, message: 'Password updated securely' });
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('updatePassword error:', error);
            res.status(500).json({ error: 'Server error updating password' });
        }
    }
}

module.exports = new UserController();
