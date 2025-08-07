CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    balance NUMERIC CHECK (balance >= 0) NOT NULL
);

CREATE TABLE IF NOT EXISTS movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount NUMERIC CHECK (amount > 0) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert 6 default accounts
INSERT INTO accounts (balance) VALUES 
(1000),
(500),
(750),
(300),
(1200),
(900);
