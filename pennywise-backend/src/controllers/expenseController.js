const ExpenseService = require('../services/expenseService');
const quickAddService = require('../services/quickAddService');

class ExpenseController {
    async createExpense(req, res) {
        try {
            const { description, amount, creatorId, groupId, splits } = req.body;
            const result = await ExpenseService.createExpenseWithSplits(description, amount, creatorId, groupId, splits);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error creating expense:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async quickAdd(req, res) {
        try {
            const { input, creatorId, groupId } = req.body;
            const result = await quickAddService.processQuickAdd(input, creatorId, groupId);
            res.status(201).json({ success: true, data: result });
        } catch (error) {
            console.error('Error in Quick Add:', error);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async exportMonthlyCSV(req, res) {
        try {
            const db = require('../db');
            const userId = req.user.id;
            const client = await db.getClient();
            try {
                // Fetch user expenses in the last 30 days
                const query = `
                    SELECT description, amount, timestamp 
                    FROM Expenses 
                    WHERE creator_id = $1 AND timestamp >= NOW() - INTERVAL '30 days'
                    ORDER BY timestamp DESC
                `;
                const result = await client.query(query, [userId]);
                
                // Build CSV payload
                let csv = 'Description,Amount (Paise),Date\n';
                result.rows.forEach(row => {
                    const rowDate = new Date(row.timestamp).toISOString().split('T')[0];
                    csv += `"${row.description}",${row.amount},${rowDate}\n`;
                });

                res.header('Content-Type', 'text/csv');
                res.attachment('pennywise_monthly_report.csv');
                return res.send(csv);
            } finally {
                client.release();
            }
        } catch (error) {
            console.error('Error exporting CSV:', error);
            res.status(500).json({ success: false, error: 'Failed to generate CSV record' });
        }
    }
}
module.exports = new ExpenseController();
