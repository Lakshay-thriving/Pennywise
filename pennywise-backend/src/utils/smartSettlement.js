/**
 * Smart Settlement Algorithm (Debt Minimization)
 * 
 * Takes an array of debt edges: [{ payerId, receiverId, amount }]
 * Returns the minimal set of optimal transactions: [{ from, to, amount }]
 * 
 * Strategy: Greedy Algorithm (O(N log N))
 */

function simplifyDebts(transactions) {
    // 1. Calculate net balances for each user
    const balances = {};

    for (const txn of transactions) {
        const { payerId, receiverId, amount } = txn;
        
        // Ensure balances exist
        if (!balances[payerId]) balances[payerId] = 0;
        if (!balances[receiverId]) balances[receiverId] = 0;

        // payerId is the person who owes money to the receiverId (expense creator)
        // So receiverId gets money (+), payerId loses money (-)
        balances[receiverId] += amount;
        balances[payerId] -= amount;
    }

    // 2. Separate into Debtors and Creditors
    const debtors = []; // People who owe money (negative balance)
    const creditors = []; // People getting money back (positive balance)

    for (const [userId, balance] of Object.entries(balances)) {
        if (balance < 0) {
            debtors.push({ userId: parseInt(userId), amount: -balance }); // Store as positive debt
        } else if (balance > 0) {
            creditors.push({ userId: parseInt(userId), amount: balance });
        }
    }

    // 3. Sort ascending/descending so we match out the largest amounts first
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    const optimalTransactions = [];
    let i = 0; // Debtor index
    let j = 0; // Creditor index

    // 4. Greedily match 
    while (i < debtors.length && j < creditors.length) {
        const debtor = debtors[i];
        const creditor = creditors[j];

        // The minimum amount between the largest debt and largest credit
        const settlementAmount = Math.min(debtor.amount, creditor.amount);

        optimalTransactions.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: settlementAmount
        });

        // Deduct the settled amount
        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;

        // Move pointers if balance is cleared
        if (debtor.amount === 0) i++;
        if (creditor.amount === 0) j++;
    }

    return optimalTransactions;
}

module.exports = { simplifyDebts };
