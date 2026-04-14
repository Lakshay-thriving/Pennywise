// Strategy Pattern: Strategy Interface
class SplitStrategy {
    calculateSplits(totalAmount, participants) {
        throw new Error("calculateSplits() must be implemented");
    }
}

class EqualSplitStrategy extends SplitStrategy {
    calculateSplits(totalAmount, participants) {
        const splitAmount = Math.floor(totalAmount / participants.length);
        let remainder = totalAmount % participants.length;
        
        return participants.map((p) => {
            let amount = splitAmount;
            if (remainder > 0) {
                amount += 1;
                remainder -= 1;
            }
            return { userId: p.userId, amount };
        });
    }
}

class PercentageSplitStrategy extends SplitStrategy {
    calculateSplits(totalAmount, participants) {
        // participants should have {userId, percentage}
        return participants.map((p) => {
            const amount = Math.round((totalAmount * p.percentage) / 100);
            return { userId: p.userId, amount };
        });
    }
}

class ExactSplitStrategy extends SplitStrategy {
    calculateSplits(totalAmount, participants) {
        // participants should have {userId, exactAmount}
        let currentTotal = 0;
        const splits = participants.map(p => {
            currentTotal += p.exactAmount;
            return { userId: p.userId, amount: p.exactAmount };
        });
        if (currentTotal !== totalAmount) {
            throw new Error("Exact amounts do not add up to total");
        }
        return splits;
    }
}

module.exports = { EqualSplitStrategy, PercentageSplitStrategy, ExactSplitStrategy };
