const cron = require('node-cron');
const db = require('../db');
const expenseService = require('../services/expenseService'); // Note: Make sure it exports instance or methods

class CronJobs {
    start() {
        console.log("Initializing Cron Jobs...");

        // Run every day at midnight (00:00)
        cron.schedule('0 0 * * *', async () => {
            console.log("Running recurring expenses job...");
            const client = await db.getClient();
            try {
                await client.query('BEGIN');
                
                // Select expenses that are due today or in the past
                const dueRes = await client.query(`
                    SELECT rr.id as rule_id, rr.expense_id, rr.frequency, rr.next_occurrence_date, rr.end_date,
                           e.description, e.amount, e.currency, e.creator_id, e.group_id
                    FROM recurring_rules rr
                    JOIN Expenses e ON rr.expense_id = e.id
                    WHERE rr.next_occurrence_date <= CURRENT_DATE
                      AND (rr.end_date IS NULL OR rr.end_date >= CURRENT_DATE)
                `);

                for (const row of dueRes.rows) {
                    // 1. Fetch splits for the original expense
                    const splitRes = await client.query('SELECT user_id, amount_owed FROM Splits WHERE expense_id = $1', [row.expense_id]);
                    const splits = splitRes.rows.map(s => ({ userId: s.user_id, amount: s.amount_owed }));

                    // 2. We bypass generic service here and do direct cloning to avoid re-calculating exchange rate 
                    // unless we want to map it back. It's safer to just clone the converted base amounts.
                    const expenseRes = await client.query(
                        'INSERT INTO Expenses (description, amount, currency, creator_id, group_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                        [`[Recurring] ${row.description}`, row.amount, row.currency, row.creator_id, row.group_id, 'Pending']
                    );
                    const newExpenseId = expenseRes.rows[0].id;

                    for (const split of splits) {
                        await client.query(
                            'INSERT INTO Splits (expense_id, user_id, amount_owed) VALUES ($1, $2, $3)',
                            [newExpenseId, split.userId, split.amount]
                        );
                    }

                    // 3. Update next_occurrence_date
                    let intervalStr = '1 day';
                    if (row.frequency === 'Weekly') intervalStr = '1 week';
                    if (row.frequency === 'Monthly') intervalStr = '1 month';
                    if (row.frequency === 'Yearly') intervalStr = '1 year';

                    await client.query(`
                        UPDATE recurring_rules 
                        SET next_occurrence_date = next_occurrence_date + interval '${intervalStr}'
                        WHERE id = $1
                    `, [row.rule_id]);
                }

                await client.query('COMMIT');
                console.log(`Processed ${dueRes.rowCount} recurring expenses.`);
            } catch (err) {
                await client.query('ROLLBACK');
                console.error("Error processing recurring expenses:", err);
            } finally {
                client.release();
            }
        });
    }
}

module.exports = new CronJobs();
