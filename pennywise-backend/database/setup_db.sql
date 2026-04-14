-- pennywise_db schema

-- Users Table
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Groups Table
CREATE TABLE IF NOT EXISTS Groups (
    id SERIAL PRIMARY KEY,
    group_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Group Members (Many-to-Many)
CREATE TABLE IF NOT EXISTS Group_Members (
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    group_id INT REFERENCES Groups(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, group_id)
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS Expenses (
    id SERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount INT NOT NULL, -- Storing in minimal currency unit (e.g., paise/cents)
    currency VARCHAR(3) DEFAULT 'INR',
    creator_id INT REFERENCES Users(id) ON DELETE SET NULL,
    group_id INT REFERENCES Groups(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Pending',
    is_deleted BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Splits Table
CREATE TABLE IF NOT EXISTS Splits (
    id SERIAL PRIMARY KEY,
    expense_id INT REFERENCES Expenses(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount_owed INT NOT NULL,
    is_paid BOOLEAN DEFAULT FALSE
);

-- Exchange Rates Table
CREATE TABLE IF NOT EXISTS exchange_rates (
    currency_code VARCHAR(3) PRIMARY KEY,
    rate_to_inr DECIMAL(10, 4) NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recurring Rules Table
CREATE TABLE IF NOT EXISTS recurring_rules (
    id SERIAL PRIMARY KEY,
    expense_id INT REFERENCES Expenses(id) ON DELETE CASCADE,
    frequency VARCHAR(50) NOT NULL,
    next_occurrence_date DATE NOT NULL,
    end_date DATE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS Payments (
    id SERIAL PRIMARY KEY,
    payer_id INT REFERENCES Users(id) ON DELETE CASCADE,
    receiver_id INT REFERENCES Users(id) ON DELETE CASCADE,
    amount INT NOT NULL,
    group_id INT REFERENCES Groups(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Budgets Table
CREATE TABLE IF NOT EXISTS Budgets (
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    limit_amount INT NOT NULL,
    PRIMARY KEY (user_id, category)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS Comments (
    id SERIAL PRIMARY KEY,
    expense_id INT REFERENCES Expenses(id) ON DELETE CASCADE,
    user_id INT REFERENCES Users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS Audit_Logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES Users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trigger Function: Validate Split Sum
CREATE OR REPLACE FUNCTION validate_split_sum()
RETURNS TRIGGER AS $$
DECLARE
    total_amount INT;
    split_sum INT;
BEGIN
    SELECT amount INTO total_amount FROM Expenses WHERE id = NEW.expense_id;
    SELECT COALESCE(SUM(amount_owed), 0) INTO split_sum FROM Splits WHERE expense_id = NEW.expense_id;
    
    IF total_amount != split_sum THEN
        RAISE EXCEPTION 'Split sum (%) does not equal total expense amount (%) for expense_id %', split_sum, total_amount, NEW.expense_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Constraint Trigger (Checks at COMMIT to avoid per-row insertion errors)
DROP TRIGGER IF EXISTS ensure_split_sum ON Splits;
CREATE CONSTRAINT TRIGGER ensure_split_sum
AFTER INSERT OR UPDATE ON Splits
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION validate_split_sum();
