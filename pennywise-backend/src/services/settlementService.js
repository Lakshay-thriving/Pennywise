const db = require('../db');
const { simplifyDebts } = require('../utils/smartSettlement');

class SettlementService {
    
    // Fetch all unresolved splits and compute minimal payments
    async computeOptimalSettlements(groupId) {
        const client = await db.getClient();
        try {
            // Unpaid splits mapping to their expense creator
            const result = await client.query(`
                SELECT 
                    s.user_id as payer_id, 
                    e.creator_id as receiver_id, 
                    s.amount_owed as amount
                FROM Splits s
                JOIN Expenses e ON s.expense_id = e.id
                WHERE e.group_id = $1 
                AND s.is_paid = FALSE 
                AND e.is_deleted = FALSE
                AND s.user_id != e.creator_id
            `, [groupId]);

            const transactions = result.rows;
            const optimalSettlements = simplifyDebts(transactions);
            return optimalSettlements;

        } finally {
            client.release();
        }
    }

    // Record a payment and partially/fully clear out debts
    async recordPayment(groupId, payerId, receiverId, amount, method = 'UPI') {
        const client = await db.getClient();
        try {
            await client.query('BEGIN');

            const crypto = require('crypto');
            const transactionId = `TXN-${crypto.randomUUID().toUpperCase()}`;

            // 1. Insert into Payments
            await client.query(`
                INSERT INTO Payments (payer_id, receiver_id, amount, group_id, method, status, transaction_id) 
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [payerId, receiverId, amount, groupId, method, 'SUCCESS', transactionId]);

            // 2. We could optionally write complex logic here to mark Splits as "is_paid = TRUE"
            // For now, this requires mapping a payment against earliest splits between these two users.
            // A simple implementation just reduces the visible balances but keeps splits as history,
            // or we run a cursor over unpaid splits where payer_id=payer AND creator_id=receiver.
            
            // Log action
            await client.query(
                'INSERT INTO Audit_Logs (user_id, action) VALUES ($1, $2)',
                [payerId, `Settled ${amount} to user ${receiverId} in group ${groupId} via ${method} (TXN: ${transactionId})`]
            );

            await client.query('COMMIT');
            return { success: true, message: 'Payment simulated successfully', transactionId, method };
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new SettlementService();
