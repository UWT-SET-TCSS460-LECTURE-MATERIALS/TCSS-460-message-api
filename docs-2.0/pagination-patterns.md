# Pagination Patterns in REST APIs

## Table of Contents
- [Introduction](#introduction)
- [Why Pagination?](#why-pagination)
- [Pagination Methods](#pagination-methods)
  - [Page-Based Pagination](#page-based-pagination)
  - [Offset-Based Pagination](#offset-based-pagination)
  - [Cursor-Based Pagination](#cursor-based-pagination)
- [Implementation in TCSS-460 Message API](#implementation-in-tcss-460-message-api)
- [SQL Implementation Details](#sql-implementation-details)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)
- [Testing Pagination](#testing-pagination)

## Introduction

> **Pronunciation Note:** The term "pagination" is pronounced **PAJ-ih-NAY-shun** (like "badge"), not "PAGE-ih-NAY-shun". While derived from the word "page," the standard English pronunciation uses a soft 'g' sound, following the same pattern as navigate → navigation.

Pagination is a technique for breaking large datasets into smaller, manageable chunks (pages). Instead of returning thousands of records in a single response, pagination allows clients to retrieve data in increments, improving performance, reducing bandwidth, and enhancing user experience.

**Key Benefits:**
- **Performance**: Faster queries and responses
- **Memory**: Reduces server and client memory usage
- **User Experience**: Progressive loading, faster initial page loads
- **Bandwidth**: Smaller response payloads

## Why Pagination?

### The Problem: Unpaginated Responses

```http
GET /message/all HTTP/1.1

Response: 200 OK
{
  "success": true,
  "data": {
    "entries": [
      /* 10,000 message objects */
    ],
    "totalCount": 10000
  }
}
```

**Issues:**
1. **Slow database query**: `SELECT *` on large tables
2. **High memory usage**: Loading all records into memory
3. **Network overhead**: Large JSON payload
4. **Poor UX**: Long wait for first content
5. **Wasted resources**: Client may only need first 10 items

### The Solution: Paginated Responses

```http
GET /message/all/paginated?page=1&limit=10 HTTP/1.1

Response: 200 OK
{
  "success": true,
  "data": {
    "entries": [
      /* Only 10 message objects */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalCount": 10000,
      "totalPages": 1000,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

**Benefits:**
1. **Fast query**: `SELECT * LIMIT 10`
2. **Low memory**: Only 10 records loaded
3. **Small payload**: ~1KB instead of ~1MB
4. **Quick response**: User sees data immediately
5. **Efficient**: Only fetch what's needed

## Pagination Methods

### Page-Based Pagination

**Concept**: Divide data into numbered pages, like a book.

**URL Pattern**:
```
GET /message/all/paginated?page=2&limit=10
```

**Parameters**:
- `page` (integer, 1-indexed): Which page to retrieve
- `limit` (integer): Number of items per page

**Response Metadata**:
```json
{
  "page": 2,
  "limit": 10,
  "totalCount": 45,
  "totalPages": 5,
  "hasNext": true,
  "hasPrevious": true
}
```

**Calculation**:
```
offset = (page - 1) * limit
```

**Example**:
```
Page 1: offset=0,  limit=10  → items 1-10
Page 2: offset=10, limit=10  → items 11-20
Page 3: offset=20, limit=10  → items 21-30
```

**SQL Query**:
```sql
SELECT * FROM messages
ORDER BY created_at DESC
LIMIT 10 OFFSET 10;  -- Page 2, limit 10
```

**Pros**:
✅ User-friendly (page numbers are intuitive)
✅ Easy navigation (next/previous page)
✅ Good for UI pagination controls
✅ Total pages calculation available

**Cons**:
❌ Page drift: If data changes between requests, items can appear twice or be skipped
❌ Less flexible than offset-based
❌ Requires calculating offset from page number

**Use Cases**:
- Blog posts
- Search results
- Product listings
- Any UI with page number controls

### Offset-Based Pagination

**Concept**: Specify how many records to skip before starting to return results.

**URL Pattern**:
```
GET /message/all/paginated?offset=20&limit=10
```

**Parameters**:
- `offset` (integer, 0-indexed): Number of records to skip
- `limit` (integer): Number of items to return

**Response Metadata**:
```json
{
  "offset": 20,
  "limit": 10,
  "totalCount": 45,
  "hasNext": true,
  "hasPrevious": true
}
```

**Example**:
```
offset=0,  limit=10  → items 1-10
offset=10, limit=10  → items 11-20
offset=20, limit=10  → items 21-30
```

**SQL Query**:
```sql
SELECT * FROM messages
ORDER BY created_at DESC
LIMIT 10 OFFSET 20;  -- Skip 20, return 10
```

**Pros**:
✅ More flexible (can skip arbitrary amounts)
✅ Direct control over starting position
✅ No calculation needed (offset used directly)
✅ Good for infinite scroll

**Cons**:
❌ Less intuitive for users (what does offset=20 mean?)
❌ Same page drift issue as page-based
❌ No built-in page numbering

**Use Cases**:
- Infinite scroll implementations
- APIs where clients need fine-grained control
- Mobile apps loading more content
- Data export/batch processing

### Cursor-Based Pagination

**Concept**: Use a unique identifier (cursor) to mark position in the dataset.

**URL Pattern**:
```
GET /message/all/paginated?cursor=eyJpZCI6MTIzfQ&limit=10
```

**Parameters**:
- `cursor` (string, base64-encoded): Pointer to last seen item
- `limit` (integer): Number of items to return

**Response Metadata**:
```json
{
  "nextCursor": "eyJpZCI6MTMzfQ==",
  "prevCursor": "eyJpZCI6MTEzfQ==",
  "hasNext": true,
  "hasPrevious": true
}
```

**SQL Query**:
```sql
SELECT * FROM messages
WHERE id > 123  -- Cursor decoded to id=123
ORDER BY id ASC
LIMIT 10;
```

**Pros**:
✅ No page drift (stable pagination)
✅ Efficient (indexed queries)
✅ Great for real-time data
✅ Works with changing datasets

**Cons**:
❌ Can't jump to arbitrary pages
❌ No total count (expensive to calculate)
❌ More complex implementation
❌ Cursor encoding/decoding required

**Use Cases**:
- Social media feeds
- Real-time chat applications
- Frequently changing data
- Large datasets where count is expensive

**Note**: Cursor-based pagination is NOT implemented in the TCSS-460 Message API, but is included here for educational completeness.

## Implementation in TCSS-460 Message API

### Architecture Overview

The pagination implementation follows **Option 4** from our architectural analysis:

```
Request → Validation Middleware → Controller → Helper Function → Database
```

**Components**:
1. **Validation Middleware** (`validatePaginationParams`): Ensures only ONE pagination method used
2. **Controller** (`getAllMessagesPaginated`): Thin orchestration layer
3. **Helper Functions**: Contain SQL query logic
   - `getMessagesWithPagePagination(page, limit, priority?)`
   - `getMessagesWithOffsetPagination(offset, limit, priority?)`

### Endpoints

#### Public Endpoints
```
GET /message/all/paginated?page=1&limit=10
GET /message/all/paginated?offset=0&limit=10
GET /message/paginated?priority=1&page=1&limit=10
GET /message/paginated?priority=2&offset=0&limit=10
```

#### Protected Endpoints (Require X-API-Key)
```
GET /protected/message/all/paginated?page=1&limit=10
GET /protected/message/all/paginated?offset=0&limit=10
GET /protected/message/paginated?priority=1&page=1&limit=10
GET /protected/message/paginated?priority=3&offset=0&limit=10
```

### Request Parameters

| Parameter | Type | Required | Range | Default | Description |
|-----------|------|----------|-------|---------|-------------|
| `page` | integer | No* | 1+ | 1 | Page number (1-indexed) |
| `offset` | integer | No* | 0+ | 0 | Records to skip (0-indexed) |
| `limit` | integer | No | 1-100 | 10 | Items per page |
| `priority` | integer | Yes (for priority endpoints) | 1-3 | N/A | Priority filter |

*Cannot use both `page` and `offset` in same request

### Validation Rules

**Mutual Exclusion**:
```javascript
if (page && offset) {
  return 400 Error: "Cannot use both page and offset parameters"
}
```

**Range Validation**:
```javascript
page >= 1        // Must be positive
offset >= 0      // Can be zero
1 <= limit <= 100  // Bounded range
```

### Response Format

#### Page-Based Response
```json
{
  "success": true,
  "message": "Retrieved page 2 of messages (10 per page)",
  "data": {
    "entries": [
      {
        "name": "Alice",
        "message": "Hello World",
        "priority": 1,
        "formatted": "{1} - [Alice] says: Hello World"
      }
    ],
    "pagination": {
      "page": 2,
      "limit": 10,
      "totalCount": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrevious": true
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Offset-Based Response
```json
{
  "success": true,
  "message": "Retrieved 10 message(s) starting at offset 20",
  "data": {
    "entries": [ /* ... */ ],
    "pagination": {
      "offset": 20,
      "limit": 10,
      "totalCount": 45,
      "hasNext": true,
      "hasPrevious": true
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## SQL Implementation Details

### Page-Based Pagination Query

```sql
-- Calculate offset from page number
-- Page 1: offset = (1 - 1) * 10 = 0
-- Page 2: offset = (2 - 1) * 10 = 10
-- Page 3: offset = (3 - 1) * 10 = 20

-- Data query
SELECT name, message, priority
FROM messages
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
-- Parameters: [limit, (page - 1) * limit]

-- Count query (parallel execution)
SELECT COUNT(*) FROM messages;
```

**TypeScript Implementation**:
```typescript
const getMessagesWithPagePagination = async (
  page: number,
  limit: number
): Promise<PaginatedMessageResponse> => {
  const pool = getPool();
  const offset = (page - 1) * limit;

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      'SELECT name, message, priority FROM messages ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    ),
    pool.query('SELECT COUNT(*) FROM messages')
  ]);

  const totalCount = parseInt(countResult.rows[0].count);
  const totalPages = Math.ceil(totalCount / limit);

  return {
    entries: dataResult.rows.map(formatMessage),
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1
    }
  };
};
```

### Offset-Based Pagination Query

```sql
-- Use offset directly (no calculation needed)

-- Data query
SELECT name, message, priority
FROM messages
ORDER BY created_at DESC
LIMIT $1 OFFSET $2;
-- Parameters: [limit, offset]

-- Count query (parallel execution)
SELECT COUNT(*) FROM messages;
```

**TypeScript Implementation**:
```typescript
const getMessagesWithOffsetPagination = async (
  offset: number,
  limit: number
): Promise<PaginatedMessageResponse> => {
  const pool = getPool();

  const [dataResult, countResult] = await Promise.all([
    pool.query(
      'SELECT name, message, priority FROM messages ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    ),
    pool.query('SELECT COUNT(*) FROM messages')
  ]);

  const totalCount = parseInt(countResult.rows[0].count);

  return {
    entries: dataResult.rows.map(formatMessage),
    pagination: {
      offset,
      limit,
      totalCount,
      hasNext: offset + limit < totalCount,
      hasPrevious: offset > 0
    }
  };
};
```

### Priority Filtering

Both pagination methods support optional priority filtering:

```sql
-- With priority filter
SELECT name, message, priority
FROM messages
WHERE priority = $1  -- Priority filter
ORDER BY created_at DESC
LIMIT $2 OFFSET $3;
-- Parameters: [priority, limit, offset]

-- Count query with filter
SELECT COUNT(*)
FROM messages
WHERE priority = $1;
-- Parameters: [priority]
```

### Performance Optimization

**Parallel Queries**: Data and count queries execute concurrently:
```typescript
const [dataResult, countResult] = await Promise.all([
  pool.query(/* data query */),
  pool.query(/* count query */)
]);
```

**Index Usage**: Ensure `created_at` column is indexed for fast `ORDER BY`:
```sql
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_priority ON messages(priority);
```

## Best Practices

### 1. Set Reasonable Limits

```typescript
// Good: Bounded limits prevent abuse
const limit = Math.min(parseInt(req.query.limit) || 10, 100);

// Bad: Unbounded limit allows large requests
const limit = parseInt(req.query.limit);  // User can request 999999
```

### 2. Provide Pagination Metadata

Always include:
- `totalCount`: Total items available
- `hasNext`: Can user request next page?
- `hasPrevious`: Can user go back?

Optional but helpful:
- `totalPages`: For page-based only
- `page` or `offset`: Echo back what was requested

### 3. Use Consistent Ordering

```sql
-- Good: Explicit, consistent ordering
SELECT * FROM messages
ORDER BY created_at DESC, id DESC
LIMIT 10 OFFSET 20;

-- Bad: Non-deterministic order (results may vary)
SELECT * FROM messages
LIMIT 10 OFFSET 20;
```

### 4. Handle Edge Cases

```typescript
// Empty results
if (result.entries.length === 0 && page === 1) {
  // Return empty array, not 404
  return { entries: [], pagination: { /* ... */ } };
}

// Invalid page (beyond total pages)
if (page > totalPages && totalPages > 0) {
  // Return 400 or redirect to last valid page
}

// Negative values already handled by validation middleware
```

### 5. Document Defaults

Make defaults explicit in documentation:
- Default `page`: 1
- Default `offset`: 0
- Default `limit`: 10
- Maximum `limit`: 100

### 6. Consider Caching

```typescript
// Cache count queries (expensive on large tables)
const cacheKey = `message:count:priority:${priority}`;
let totalCount = await cache.get(cacheKey);

if (!totalCount) {
  totalCount = await pool.query('SELECT COUNT(*)...');
  await cache.set(cacheKey, totalCount, 300); // 5-minute TTL
}
```

## Common Pitfalls

### 1. The Page Drift Problem

**Scenario**: User is viewing page 2 when a new item is inserted at the beginning.

**Before insertion** (Page 2):
```
Items 11-20: [Message11, Message12, ..., Message20]
```

**After insertion** (Same Page 2 query):
```
Items 11-20: [Message10, Message11, ..., Message19]
```

**Result**: Message10 appears again (user saw it on page 1), Message20 disappears.

**Solutions**:
- Accept this limitation for page/offset pagination
- Use cursor-based pagination for frequently changing data
- Add timestamp to requests and filter `WHERE created_at <= :request_time`
- Implement optimistic locking

### 2. Expensive COUNT Queries

```sql
-- Expensive on large tables
SELECT COUNT(*) FROM messages;  -- Full table scan

-- Optimization options:
SELECT COUNT(*) FROM messages WHERE priority = 1;  -- Smaller subset
SELECT reltuples::bigint FROM pg_class WHERE relname = 'messages';  -- Approximate count
-- Cache the count (acceptable if slight staleness OK)
```

### 3. Deep Pagination Performance

```sql
-- Slow: OFFSET 10000
SELECT * FROM messages ORDER BY created_at DESC LIMIT 10 OFFSET 10000;
-- Database must read and discard 10000 rows

-- Better: Use cursor-based pagination for deep pages
SELECT * FROM messages WHERE created_at < :last_seen_timestamp
ORDER BY created_at DESC LIMIT 10;
```

### 4. Not Validating Both Parameters

```javascript
// Bad: Allows both page and offset
if (req.query.page) { /* use page */ }
else { /* use offset */ }

// Good: Explicitly reject conflicting parameters
if (req.query.page && req.query.offset) {
  throw new Error('Cannot use both page and offset');
}
```

### 5. Zero-Indexed vs One-Indexed Confusion

```javascript
// Be consistent:
// - page: 1-indexed (page 1, page 2, page 3)
// - offset: 0-indexed (offset 0, offset 10, offset 20)

// Document clearly which is used
```

## Testing Pagination

### Test Cases

#### 1. Basic Pagination
```javascript
// Page 1
GET /message/all/paginated?page=1&limit=5
Expect: page=1, hasPrevious=false, hasNext=true (if >5 items)

// Offset 0
GET /message/all/paginated?offset=0&limit=5
Expect: offset=0, hasPrevious=false, hasNext=true (if >5 items)
```

#### 2. Boundary Conditions
```javascript
// Last page
GET /message/all/paginated?page=10&limit=5  // With 50 total items
Expect: page=10, hasPrevious=true, hasNext=false

// Empty results (page beyond end)
GET /message/all/paginated?page=999&limit=5
Expect: entries=[], totalPages calculated correctly

// Limit edge cases
GET /message/all/paginated?limit=1    // Minimum
GET /message/all/paginated?limit=100  // Maximum
```

#### 3. Error Conditions
```javascript
// Both parameters
GET /message/all/paginated?page=1&offset=10&limit=5
Expect: 400 Error

// Invalid values
GET /message/all/paginated?page=0&limit=5    // page < 1
GET /message/all/paginated?offset=-1&limit=5  // offset < 0
GET /message/all/paginated?page=1&limit=200   // limit > max
```

#### 4. Data Consistency
```javascript
// Verify no duplicates across pages
const page1 = await fetch('?page=1&limit=10');
const page2 = await fetch('?page=2&limit=10');
const ids1 = page1.data.entries.map(e => e.name);
const ids2 = page2.data.entries.map(e => e.name);
expect(intersection(ids1, ids2)).toEqual([]);  // No overlap

// Verify total count matches
const allPages = [];
let page = 1;
while (hasNext) {
  const result = await fetch(`?page=${page}&limit=10`);
  allPages.push(...result.data.entries);
  hasNext = result.data.pagination.hasNext;
  page++;
}
expect(allPages.length).toEqual(firstResponse.data.pagination.totalCount);
```

### Postman Tests

The TCSS-460 Message API includes comprehensive Postman tests in folder **"8. Pagination Tests"**:

1. **Get All Messages - Page-based Pagination**
2. **Get All Messages - Offset-based Pagination**
3. **Get Priority Messages - Page-based Pagination**
4. **Get Priority Messages - Offset-based Pagination**
5. **Pagination Error - Both page and offset**
6. **Protected - Get All Messages Paginated**
7. **Protected - Get Priority Messages Paginated**

Run these tests to verify pagination functionality.

---

## Summary

**Pagination is essential for:**
- ✅ Performance at scale
- ✅ Better user experience
- ✅ Reduced server load
- ✅ Lower bandwidth usage

**Choose the right method:**
- **Page-based**: UI with page numbers
- **Offset-based**: Infinite scroll, flexible positioning
- **Cursor-based**: Real-time, frequently changing data

**Remember:**
- Always set maximum limits
- Provide comprehensive metadata
- Use consistent ordering
- Handle edge cases gracefully
- Test boundary conditions

---

**References:**
- API Swagger Documentation: `/api-docs`
- Source Code: `src/controllers/messageController.ts`
- Postman Tests: `testing/postman/TCSS-460-Message-API-Complete.postman_collection.json`
- REST API Design: `docs/api-design-patterns.md`
