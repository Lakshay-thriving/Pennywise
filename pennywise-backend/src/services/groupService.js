const db = require('../db');

class GroupService {
    async createGroup(name, creatorId) {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');
            const res = await client.query('INSERT INTO Groups (group_name) VALUES ($1) RETURNING id', [name]);
            const groupId = res.rows[0].id;
            
            await client.query('INSERT INTO Group_Members (user_id, group_id) VALUES ($1, $2)', [creatorId, groupId]);
            
            await client.query(
                'INSERT INTO Audit_Logs (user_id, action) VALUES ($1, $2)',
                [creatorId, `Created group ${name} (ID: ${groupId})`]
            );
            await client.query('COMMIT');
            return { id: groupId, name };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    // FR-24: Activity Feed (Chronological events in group)
    async getActivityFeed(groupId, limit = 50) {
        const client = await db.getClient();
        try {
            // Fetch Expenses and Payments as events
            const result = await client.query(`
                SELECT 
                    'EXPENSE_ADDED' as type,
                    e.timestamp as event_date,
                    u.name as actor_name,
                    e.description as detail,
                    e.amount,
                    e.currency
                FROM Expenses e
                JOIN Users u ON e.creator_id = u.id
                WHERE e.group_id = $1 AND e.is_deleted = FALSE

                UNION ALL

                SELECT 
                    'PAYMENT_MADE' as type,
                    p.timestamp as event_date,
                    u.name as actor_name,
                    'Paid user ID: ' || p.receiver_id as detail,
                    p.amount,
                    'INR' as currency
                FROM Payments p
                JOIN Users u ON p.payer_id = u.id
                WHERE p.group_id = $1

                ORDER BY event_date DESC
                LIMIT $2
            `, [groupId, limit]);

            return result.rows;
        } finally {
            client.release();
        }
    }

    // FR-36: Group Insights
    async getGroupInsights(groupId) {
        const client = await db.getClient();
        try {
            // Who spends the most?
            const spenders = await client.query(`
                SELECT u.name, SUM(e.amount) as total_spent
                FROM Expenses e
                JOIN Users u ON e.creator_id = u.id
                WHERE e.group_id = $1 AND e.is_deleted = FALSE
                GROUP BY u.name
                ORDER BY total_spent DESC
                LIMIT 5
            `, [groupId]);

            return {
                topSpenders: spenders.rows
            };
        } finally {
            client.release();
        }
    }
}

module.exports = new GroupService();
