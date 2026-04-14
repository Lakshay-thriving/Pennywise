-- Advanced Features Schema

CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_amount INT NOT NULL,
    current_amount INT DEFAULT 0,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount INT NOT NULL,
    frequency VARCHAR(50) NOT NULL, -- e.g. 'MONTHLY', 'WEEKLY'
    last_detected_date DATE,
    status VARCHAR(50) DEFAULT 'DETECTED' -- or 'CONFIRMED'
);

-- Modify Payments to simulate UPI/Bank Transfers properly
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='method') THEN
        ALTER TABLE Payments ADD COLUMN method VARCHAR(50) DEFAULT 'CASH';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='status') THEN
        ALTER TABLE Payments ADD COLUMN status VARCHAR(50) DEFAULT 'SUCCESS';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payments' AND column_name='transaction_id') THEN
        ALTER TABLE Payments ADD COLUMN transaction_id VARCHAR(100);
    END IF;
END
$$;

-- Indexes for scaling advanced features
CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
