const settlementService = require('../services/settlementService');

class SettlementController {
    async getOptimalSettlements(req, res) {
        try {
            const { groupId } = req.params;
            const settlements = await settlementService.computeOptimalSettlements(groupId);
            res.status(200).json({ success: true, data: settlements });
        } catch (error) {
            console.error('Error computing settlements:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async recordPayment(req, res) {
        try {
            const { groupId } = req.params;
            const { payerId, receiverId, amount, method } = req.body;
            const result = await settlementService.recordPayment(groupId, payerId, receiverId, amount, method);
            res.status(201).json(result);
        } catch (error) {
            console.error('Error recording payment:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new SettlementController();
