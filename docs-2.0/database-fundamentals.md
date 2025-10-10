# Database Fundamentals

A comprehensive guide to database concepts and practices for web application development.

> **💡 Related Code**: See implementations in [`/src/core/utilities/transactionUtils.ts`](../src/core/utilities/transactionUtils.ts) and [`/src/core/utilities/database.ts`](../src/core/utilities/database.ts)

## Quick Navigation
- 🔧 **Transaction Utilities**: [`transactionUtils.ts`](../src/core/utilities/transactionUtils.ts) - `withTransaction()`, `executeTransactionWithResponse()`
- 🗃️ **Database Connection**: [`database.ts`](../src/core/utilities/database.ts) - Connection pooling and setup
- 🎯 **Usage Examples**: [`messageController.ts`](../src/controllers/messageController.ts) - Real transaction usage
- 🏗️ **Architecture**: [Node.js Architecture](./node-express-architecture.md#mvc-architecture-pattern) - How databases fit in MVC
- 🔒 **Security**: [Web Security Guide](./web-security-guide.md#sql-injection-prevention) - Database security practices

## Table of Contents

- [Database Transactions](#database-transactions)
- [ACID Properties](#acid-properties)
- [Connection Pooling](#connection-pooling)
- [Query Optimization](#query-optimization)
- [Database Design Principles](#database-design-principles)
- [Common Anti-Patterns](#common-anti-patterns)

---

## Database Transactions

### What is a Database Transaction?

A database transaction is a sequence of one or more database operations that are treated as a single unit. Either ALL operations succeed, or ALL operations are rolled back (undone) if any operation fails. This ensures data consistency and prevents partial updates that could corrupt your database.

### Real-World Analogy: Bank Transfer

Think of it like a bank transfer:
1. Subtract $100 from Account A
2. Add $100 to Account B

If step 2 fails, you MUST undo step 1 - otherwise money disappears from the system!

### Transaction States

- **BEGIN** - Start a new transaction
- **COMMIT** - Save all changes permanently
- **ROLLBACK** - Undo all changes and return to state before BEGIN

### When to Use Transactions

#### ✅ **Use Transactions For:**
- Multiple related database operations that must all succeed together
- Operations that could leave data in an inconsistent state if partially completed
- When you need to ensure data integrity across multiple tables

#### ❌ **Don't Use Transactions For:**
- Single, simple operations (like SELECT or single INSERT)
- Read-only operations that don't modify data
- Operations where partial success is acceptable

### Example Scenarios Requiring Transactions

1. **E-commerce order**: Create order record + update inventory + charge payment
2. **User registration**: Create user account + send welcome email + log activity
3. **Message system**: Create message + update user stats + notify subscribers

### Simple Example Without Transactions (DANGEROUS)

```typescript
// BAD: If step 2 fails, you have an order without inventory update!
await pool.query('INSERT INTO orders (user_id, total) VALUES ($1, $2)', [userId, total]);
await pool.query('UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1', [productId]); // Could fail!
```

### Safe Example With Transactions

```typescript
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query('INSERT INTO orders (user_id, total) VALUES ($1, $2)', [userId, total]);
  await client.query('UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1', [productId]);
  await client.query('COMMIT'); // Success: both operations saved
} catch (error) {
  await client.query('ROLLBACK'); // Failure: both operations undone
  throw error;
} finally {
  client.release();
}
```

### Using Our Transaction Utilities

```typescript
// From /src/core/utilities/transactionUtils.ts
const result = await withTransaction(async (client) => {
  const order = await client.query('INSERT INTO orders...');
  await client.query('UPDATE inventory...');
  return order.rows[0];
});

if (result.success) {
  console.log('Order created:', result.data);
} else {
  console.error('Transaction failed:', result.error);
}
```

---

## ACID Properties

Transactions follow ACID principles to ensure database reliability:

### **A - ATOMICITY**
All operations succeed or all fail (no partial success)

```typescript
// Either both operations happen, or neither happens
await withTransaction(async (client) => {
  await client.query('INSERT INTO users...');
  await client.query('INSERT INTO profiles...');
});
```

### **C - CONSISTENCY**
Database remains in a valid state before and after transaction

```sql
-- Database constraints ensure consistency
ALTER TABLE accounts ADD CONSTRAINT positive_balance CHECK (balance >= 0);
```

### **I - ISOLATION**
Concurrent transactions don't interfere with each other

```typescript
// Transaction isolation levels
BEGIN ISOLATION LEVEL READ COMMITTED; -- Most common
BEGIN ISOLATION LEVEL SERIALIZABLE;   -- Highest isolation
```

### **D - DURABILITY**
Once committed, changes are permanent (survive system crashes)

---

## Connection Pooling

### What is Connection Pooling?

Connection pooling maintains a cache of database connections that can be reused across multiple requests, rather than creating a new connection for each query.

### Why Connection Pooling Matters

#### ✅ **Benefits:**
- **Performance**: Reusing connections is much faster than creating new ones
- **Resource Management**: Limits concurrent database connections
- **Scalability**: Handles many concurrent users efficiently
- **Reliability**: Automatic connection recovery and health checks

#### ❌ **Without Pooling:**
- High latency from connection overhead
- Database server overwhelmed by too many connections
- Resource leaks from unclosed connections
- Poor application performance under load

### Connection Pool Configuration

```typescript
// From /src/core/utilities/database.ts
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'password',
  database: 'message_db',
  max: 20,                    // Maximum connections in pool
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Wait max 2s for connection
});
```

### Best Practices

```typescript
// ✅ GOOD: Always release connections
const client = await pool.connect();
try {
  const result = await client.query('SELECT...');
  return result.rows;
} finally {
  client.release(); // Always release!
}

// ✅ BETTER: Use pool.query() for simple queries
const result = await pool.query('SELECT * FROM messages');

// ❌ BAD: Forgetting to release
const client = await pool.connect();
const result = await client.query('SELECT...');
// Connection leak! Never released
```

---

## Query Optimization

### Understanding Query Performance

#### **1. Use Indexes Effectively**
```sql
-- Create index for frequently queried columns
CREATE INDEX idx_messages_priority ON messages(priority);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Query will use index
SELECT * FROM messages WHERE priority = 1 ORDER BY created_at;
```

#### **2. Limit Result Sets**
```typescript
// ✅ GOOD: Paginated results
const result = await pool.query(
  'SELECT * FROM messages ORDER BY created_at LIMIT $1 OFFSET $2',
  [10, page * 10]
);

// ❌ BAD: Loading all data
const result = await pool.query('SELECT * FROM messages');
```

#### **3. Use Specific Columns**
```sql
-- ✅ GOOD: Only select needed columns
SELECT name, message FROM messages WHERE priority = 1;

-- ❌ BAD: Select everything
SELECT * FROM messages WHERE priority = 1;
```

### Query Analysis Tools

```sql
-- PostgreSQL query plan analysis
EXPLAIN ANALYZE SELECT * FROM messages WHERE priority = 1;

-- Look for:
-- - Seq Scan (bad) vs Index Scan (good)
-- - High cost numbers
-- - Long execution times
```

---

## Database Design Principles

### **1. Normalization**

Organize data to reduce redundancy and improve integrity.

```sql
-- ✅ NORMALIZED: Users and Messages separate
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ❌ DENORMALIZED: Repeated user data
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100),  -- Repeated data!
  email VARCHAR(255),     -- Repeated data!
  content TEXT,
  created_at TIMESTAMP
);
```

### **2. Appropriate Data Types**

Choose the right data type for each column.

```sql
-- ✅ GOOD: Appropriate types
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,                    -- Auto-incrementing integer
  name VARCHAR(100) NOT NULL,               -- Limited-length string
  priority INTEGER CHECK (priority BETWEEN 1 AND 3), -- Constrained integer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP      -- Automatic timestamp
);

-- ❌ BAD: Poor type choices
CREATE TABLE messages (
  id VARCHAR(255),          -- String for numeric ID
  name TEXT,                -- Unlimited text for short names
  priority VARCHAR(10),     -- String for numeric value
  created_at VARCHAR(50)    -- String for date
);
```

### **3. Constraints and Validation**

Use database constraints to maintain data integrity.

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,                           -- Required field
  message TEXT NOT NULL CHECK (LENGTH(message) > 0),    -- Non-empty content
  priority INTEGER CHECK (priority BETWEEN 1 AND 3),   -- Valid range
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- Ensure name uniqueness
  CONSTRAINT unique_message_name UNIQUE (name)
);
```

---

## Common Anti-Patterns

### **1. N+1 Query Problem**

```typescript
// ❌ BAD: N+1 queries (1 + N individual queries)
const users = await pool.query('SELECT * FROM users');
for (const user of users.rows) {
  const messages = await pool.query('SELECT * FROM messages WHERE user_id = $1', [user.id]);
  user.messages = messages.rows;
}

// ✅ GOOD: Single JOIN query
const result = await pool.query(`
  SELECT u.*, m.id as message_id, m.content, m.created_at
  FROM users u
  LEFT JOIN messages m ON u.id = m.user_id
  ORDER BY u.id, m.created_at
`);
```

### **2. Missing Connection Release**

```typescript
// ❌ BAD: Connection leak
const client = await pool.connect();
const result = await client.query('SELECT...');
if (someCondition) {
  return result; // Connection never released!
}
client.release();

// ✅ GOOD: Always release in finally block
const client = await pool.connect();
try {
  const result = await client.query('SELECT...');
  return result;
} finally {
  client.release(); // Always executed
}
```

### **3. SQL Injection Vulnerability**

```typescript
// ❌ BAD: SQL injection vulnerability
const query = `SELECT * FROM users WHERE name = '${userName}'`;
await pool.query(query);

// ✅ GOOD: Parameterized query
const query = 'SELECT * FROM users WHERE name = $1';
await pool.query(query, [userName]);
```

---

## Database Monitoring and Maintenance

### **Performance Monitoring**

```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;

-- Check connection usage
SELECT count(*) as active_connections
FROM pg_stat_activity
WHERE state = 'active';
```

### **Regular Maintenance**

```sql
-- Update table statistics for query planner
ANALYZE messages;

-- Reclaim storage space
VACUUM messages;

-- Full vacuum with statistics update
VACUUM ANALYZE messages;
```

---

## Further Reading

- [PostgreSQL Documentation](https://www.postgresql.org/docs/) - Official PostgreSQL guide
- [Database Indexing Explained](https://use-the-index-luke.com/) - Comprehensive indexing guide
- [SQL Performance Explained](https://sql-performance-explained.com/) - Query optimization techniques

---

*Understanding database fundamentals is crucial for building scalable, reliable web applications. These concepts form the foundation of backend development.*
