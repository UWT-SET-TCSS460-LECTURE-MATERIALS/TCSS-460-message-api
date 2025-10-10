-- TCSS 460 Message API Database Initialization
-- Creates tables for messages and API key authentication

-- ============================================
-- Messages Table
-- ============================================
-- Stores name, message, and priority entries

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    message TEXT NOT NULL,
    priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_messages_priority ON messages(priority);
CREATE INDEX IF NOT EXISTS idx_messages_name ON messages(name);

-- ============================================
-- API Keys Table
-- ============================================
-- Stores API keys for protected endpoint authentication
-- Educational implementation showing stateful authentication

CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    request_count INTEGER DEFAULT 0
);

-- Add indexes for authentication and lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);

-- ============================================
-- Sample Data (Optional)
-- ============================================
-- Uncomment to insert test data

-- INSERT INTO messages (name, message, priority) VALUES
-- ('John Doe', 'Hello, World!', 1),
-- ('Jane Smith', 'This is a test message', 2),
-- ('Bob Johnson', 'High priority message', 3);

-- INSERT INTO api_keys (api_key, name, email) VALUES
-- ('test-key-12345678901234567890123456789012', 'Test User', 'test@example.com');