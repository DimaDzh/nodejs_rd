-- Create users table

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert 10 default users
INSERT INTO users (name, email, age) VALUES
    ('Alice Johnson', 'alice.johnson@example.com', 28),
    ('Bob Smith', 'bob.smith@example.com', 34),
    ('Charlie Brown', 'charlie.brown@example.com', 22),
    ('Diana Prince', 'diana.prince@example.com', 29),
    ('Edward Wilson', 'edward.wilson@example.com', 41),
    ('Fiona Davis', 'fiona.davis@example.com', 26),
    ('George Miller', 'george.miller@example.com', 33),
    ('Hannah Taylor', 'hannah.taylor@example.com', 24),
    ('Isaac Newton', 'isaac.newton@example.com', 45),
    ('Julia Roberts', 'julia.roberts@example.com', 31);

-- Verify the setup
SELECT 'Total users created:' as message, COUNT(*) as count FROM users;
SELECT * FROM users ORDER BY id;
