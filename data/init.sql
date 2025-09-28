-- TCSS 460 Message API Database Initialization
-- Create the messages table for storing name, message, and priority entries

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

-- Optional: Add some sample data for testing
-- INSERT INTO messages (name, message, priority) VALUES
-- ('John Doe', 'Hello, World!', 1),
-- ('Jane Smith', 'This is a test message', 2),
-- ('Bob Johnson', 'High priority message', 3);