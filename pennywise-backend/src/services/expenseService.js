const db = require('../db');
const exchangeRateService = require('./exchangeRateService');

class ExpenseService {
    // ACID Complaint Expense Creation
    async createExpenseWithSplits(description, amount, currency = 'INR', creatorId, groupId, splits) {
        const client = await db.getClient();
        try {
            // Convert to base INR if foreign currency
            let convertedAmount = amount;
            let rateMultiplier = 1.0;
            if (currency !== 'INR') {
                rateMultiplier = await exchangeRateService.getCachedRate(currency);
                convertedAmount = Math.round(amount * rateMultiplier);
            }
            
            await client.query('BEGIN');
            
            const expenseRes = await client.query(
                'INSERT INTO Expenses (description, amount, currency, creator_id, group_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                [description, convertedAmount, currency, creatorId, groupId]
            );
            const expenseId = expenseRes.rows[0].id;

            for (const split of splits) {
                // assume split amounts passed are also pre-converted or need ratio adjusting.
                // For safety in this Pro app, we expect the frontend provides raw ratio splits,
                // or if it provides absolute amounts, we multiply them by the same exchange rate.
                const splitAmountInr = Math.round(split.amount * rateMultiplier);
                
                await client.query(
                    'INSERT INTO Splits (expense_id, user_id, amount_owed) VALUES ($1, $2, $3)',
                    [expenseId, split.userId, splitAmountInr]
                );
            }

            await client.query(
                'INSERT INTO Audit_Logs (user_id, action) VALUES ($1, $2)',
                [creatorId, `Created expense ${expenseId} for ${amount} ${currency}`]
            );

            await client.query('COMMIT');
            return { expenseId };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}
module.exports = new ExpenseService();
