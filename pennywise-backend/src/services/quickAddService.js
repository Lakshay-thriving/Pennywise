const expenseService = require('./expenseService');
const db = require('../db');

class QuickAddService {
    /**
     * Parse natural language input like "Dinner 1200 with rahul@gmail.com, neha"
     * @param {string} input - The natural language input
     * @param {number} creatorId - User ID creating the expense
     * @param {number} groupId - Group ID
     */
    async processQuickAdd(input, creatorId, groupId) {
        // Regex to extract common patterns: [Description] [Amount] with [Names/Emails]
        // Example: "Dinner 1200 with rahul@gmail.com, Neha"
        const regex = /^(.*?)\s+(\d+(?:\.\d+)?)(?:\s+with\s+(.*))?$/i;
        const match = input.trim().match(regex);
        
        if (!match) {
            throw new Error("Could not parse input. Use format: 'Description Amount with email1, email2' (e.g. 'Dinner 1200 with a@b.com, c@d.com')");
        }

        const description = match[1].trim();
        const amount = parseFloat(match[2]);
        let userIdentifiersStr = match[3];

        let participantIds = [creatorId]; // Creator is always included by default

        if (userIdentifiersStr) {
            const identifiers = userIdentifiersStr.split(',').map(s => s.trim()).filter(s => s);
            
            if (identifiers.length > 0) {
                const client = await db.getClient();
                try {
                    // Look up participants by exact Email or Name (User requested exact email feature)
                    const query = `SELECT id FROM Users WHERE email = ANY($1) OR name = ANY($1)`;
                    const result = await client.query(query, [identifiers]);
                    
                    if (result.rows.length === 0) {
                        throw new Error(`Could not find any users matching: ${identifiers.join(', ')}`);
                    }

                    const extractedIds = result.rows.map(row => row.id);
                    participantIds = [...new Set([...participantIds, ...extractedIds])];
                } finally {
                    client.release();
                }
            }
        }

        if (participantIds.length === 0) {
            throw new Error("No valid participants found.");
        }

        // Equal split logic by default for Quick Add
        const splitAmount = amount / participantIds.length;
        const splits = participantIds.map(userId => ({
            userId,
            amount: splitAmount
        }));

        // Now call the core expense service to save it
        // We will default to 'INR' as the currency
        return await expenseService.createExpenseWithSplits(description, amount, 'INR', creatorId, groupId, splits);
    }
}

module.exports = new QuickAddService();
