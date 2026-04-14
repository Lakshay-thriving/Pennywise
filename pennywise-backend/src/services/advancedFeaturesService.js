const db = require('../db');

class AdvancedFeaturesService {
    // --- GOALS ---
    async createGoal(userId, title, targetAmount, currentAmount, deadline) {
        const client = await db.getClient();
        try {
            const res = await client.query(
                `INSERT INTO goals (user_id, title, target_amount, current_amount, deadline) 
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [userId, title, targetAmount, currentAmount || 0, deadline]
            );
            return res.rows[0];
        } finally {
            client.release();
        }
    }

    async getGoals(userId) {
        const client = await db.getClient();
        try {
            const res = await client.query('SELECT * FROM goals WHERE user_id = $1 ORDER BY created_at DESC', [userId]);

            // Add calculated completion estimates based on simplistic time logic
            return res.rows.map(goal => {
                const percentage = ((goal.current_amount / goal.target_amount) * 100).toFixed(1);
                
                // Assume safe metric for 'Estimated Completion': if $100 saved over 30 days, extrapolate
                let estimateMsg = "Unknown";
                if (goal.deadline) {
                    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    if (daysLeft < 0) estimateMsg = "Overdue";
                    else estimateMsg = `${daysLeft} days remaining`;
                }

                return {
                    ...goal,
                    progress_percentage: percentage,
                    estimated_completion: estimateMsg
                };
            });
        } finally {
            client.release();
        }
    }

    async updateGoalProgress(id, userId, newAmount) {
        const client = await db.getClient();
        try {
            const res = await client.query(
                'UPDATE goals SET current_amount = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
                [newAmount, id, userId]
            );
            return res.rows[0];
        } finally {
            client.release();
        }
    }

    // --- SUBSCRIPTION DETECTION ---
    async runSubscriptionDetection(userId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            
            // Basic algorithmic grouping: same description and exact same amount over last 90 days
            const query = `
                SELECT description, amount, COUNT(id) as freq_count, MAX(timestamp) as last_date
                FROM Expenses 
                WHERE creator_id = $1 
                AND is_deleted = FALSE
                AND timestamp >= NOW() - INTERVAL '90 days'
                GROUP BY description, amount
                HAVING COUNT(id) >= 2
            `;
            const recurringExpenses = await client.query(query, [userId]);

            for (const row of recurringExpenses.rows) {
                // If freq is high, let's assume it's MONTHLY for now unless proven otherwise
                const frequency = 'MONTHLY'; // basic assumption in time-series

                // Upsert to subscriptions table if not active
                const checkSub = await client.query(
                    'SELECT id FROM subscriptions WHERE user_id = $1 AND name = $2',
                    [userId, row.description]
                );

                if (checkSub.rowCount === 0) {
                    await client.query(
                        `INSERT INTO subscriptions (user_id, name, amount, frequency, last_detected_date, status)
                         VALUES ($1, $2, $3, $4, $5, 'DETECTED')`,
                        [userId, row.description, row.amount, frequency, row.last_date]
                    );
                }
            }

            await client.query('COMMIT');
            return { success: true, newDetections: recurringExpenses.rowCount };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async getSubscriptions(userId) {
        const client = await db.getClient();
        try {
             // We can lazily run detection when they view the page
             await this.runSubscriptionDetection(userId);

             const res = await client.query('SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY last_detected_date DESC', [userId]);
             return res.rows;
        } finally {
            client.release();
        }
    }

    async confirmSubscription(id, userId) {
        const client = await db.getClient();
        try {
            const res = await client.query(
                "UPDATE subscriptions SET status = 'CONFIRMED' WHERE id = $1 AND user_id = $2 RETURNING *",
                [id, userId]
            );
            return res.rows[0];
        } finally {
            client.release();
        }
    }

}

module.exports = new AdvancedFeaturesService();
