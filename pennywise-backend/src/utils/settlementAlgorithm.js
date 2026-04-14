function minimizeTransactions(balances) {
    // Balances is an object { userId: netBalance }
    // Positive means they get money back (creditor), negative means they owe money (debtor)
    const debtors = [];
    const creditors = [];
    let mathCheckSum = 0;

    for (const [userId, balance] of Object.entries(balances)) {
        const b = parseFloat(balance);
        mathCheckSum += b;
        
        if (b < -0.01) debtors.push({ userId, amount: -b });
        else if (b > 0.01) creditors.push({ userId, amount: b });
    }

    // NFR-6: Mathematical Guarantee that Net Change for any individual group equals 0
    if (Math.abs(mathCheckSum) > 0.1) {
        throw new Error(`Conservation of Debt violated: Net sum is ${mathCheckSum}`);
    }

    // Sort to optimize matching (largest debtors with largest creditors)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let d = 0, c = 0;

    while (d < debtors.length && c < creditors.length) {
        const debtor = debtors[d];
        const creditor = creditors[c];
        const settleAmount = Math.min(debtor.amount, creditor.amount);

        transactions.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: settleAmount
        });

        debtor.amount -= settleAmount;
        creditor.amount -= settleAmount;

        if (debtor.amount === 0) d++;
        if (creditor.amount === 0) c++;
    }

    return transactions;
}

module.exports = { minimizeTransactions };
