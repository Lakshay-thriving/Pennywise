const express = require('express');
const router = express.Router();
const ExpenseController = require('../controllers/expenseController');

router.post('/', ExpenseController.createExpense);
router.post('/quick', ExpenseController.quickAdd);
router.get('/export', ExpenseController.exportMonthlyCSV);

module.exports = router;
