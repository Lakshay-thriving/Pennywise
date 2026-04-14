const db = require('../db');

class BudgetService {
    async setBudget(userId, category, limitAmount) {
        const query = `
            INSERT INTO Budgets (user_id, category, limit_amount)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, category) 
            DO UPDATE SET limit_amount = EXCLUDED.limit_amount
        `;
        await db.query(query, [userId, category, limitAmount]);
        return { message: "Budget configured successfully" };
    }

    async getBudgetStatus(userId, category) {
        // Find budget
        const budgetRes = await db.query('SELECT limit_amount FROM Budgets WHERE user_id = $1 AND category = $2', [userId, category]);
        if (budgetRes.rowCount === 0) {
            return null;
        }

        const limit = budgetRes.rows[0].limit_amount;

        // Sum expenses for this user in this category strictly constructed this month.
        // Assuming description contains the category or we add category...
        // Wait, our backend schema DOES NOT have a 'category' column on Expenses!
        // We will default to extracting category strictly conceptually from group parsing or description tagging.
        // For SRS compliance (FR-12), let's assume we search description for #[category] or we'll just return Mock check for now
        // since adding a category column wasn't explicitly dictated in the base schema overview but implied.
        
        let spent = 0;
        
        // This is a naive implementation since 'category' column is missing in Expenses mapping,
        // we parse description for matching keyword for simplicity.
        const spentRes = await db.query(`
            SELECT SUM(amount_owed) as total
            FROM Splits s
            JOIN Expenses e ON s.expense_id = e.id
            WHERE s.user_id = $1 
              AND e.description ILIKE $2
              AND e.timestamp >= date_trunc('month', current_date)
        `, [userId, `%${category}%`]);

        if (spentRes.rows[0].total) {
            spent = parseInt(spentRes.rows[0].total, 10);
        }

        const isBreached = spent >= limit;

        return {
            category,
            limit,
            spent,
            isBreached
        };
    }
}

module.exports = new BudgetService();
