# TCSS-460 Message API Documentation


Educational REST API demonstrating modern Node.js/Express/TypeScript patterns for TCSS-460.

This API showcases:
- HTTP method semantics (GET, POST, PATCH, DELETE)
- Request parameter types (query parameters, path parameters, request body)
- Input validation with express-validator middleware
- Standardized response formats with consistent structure
- Error handling patterns with error codes
- Database operations with PostgreSQL connection pooling
- API documentation with OpenAPI/Swagger
- **API Key Authentication** (stateful, header-based authentication) 🔑

**Learning Objectives:**
- Understand RESTful API design principles
- Practice HTTP protocol fundamentals
- Implement proper input validation with middleware
- Create consistent API responses
- Work with databases in Node.js applications
- Document APIs for maintainability
- **Learn API authentication patterns (API Keys vs JWT)** 🔐
        

## API Information

- **Version:** 1.0.0
- **Base URL:** http://localhost:4000
- **Documentation:** [Swagger UI](/api-docs)

## Available Endpoints

### GET /health

Basic health check endpoint to verify the server is running.

**Example Request:**
```bash
GET /health HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

---

## Message API Endpoints

All message endpoints are prefixed with `/message`.

### POST /message

Create a new message with a unique sender name.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "message": "Hello World",
  "priority": 1
}
```

**Request Body Parameters:**
- `name` (required): Unique sender name (1-255 characters)
- `message` (required): Message content (non-empty string)
- `priority` (required): Priority level (1=high, 2=medium, 3=low)

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "Message created successfully",
  "data": {
    "entry": "{1} - [John Doe] says: Hello World",
    "messageId": 123,
    "name": "John Doe",
    "message": "Hello World",
    "priority": 1
  }
}
```

**Error Response - Name Already Exists (400 Bad Request):**
```json
{
  "success": false,
  "message": "A message from this name already exists",
  "errorCode": "MSG_NAME_EXISTS"
}
```

**Error Response - Validation Failed (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "priority",
      "message": "Priority must be 1, 2, or 3"
    }
  ]
}
```

**Validation Rules:**
- Name must be unique in the database
- Name length: 1-255 characters
- Message cannot be empty after trimming
- Priority must be exactly 1, 2, or 3

---

### GET /message?priority={1|2|3}

Retrieve all messages with a specific priority level.

**Query Parameters:**
- `priority` (required): Priority level to filter by (1, 2, or 3)

**Example Request:**
```bash
GET /message?priority=1 HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved 2 message(s) with priority 1",
  "data": {
    "entries": [
      {
        "name": "John",
        "message": "Important task",
        "priority": 1,
        "formatted": "{1} - [John] says: Important task"
      },
      {
        "name": "Alice",
        "message": "Critical update",
        "priority": 1,
        "formatted": "{1} - [Alice] says: Critical update"
      }
    ],
    "count": 2,
    "priority": 1
  }
}
```

**Error Response - No Messages Found (404 Not Found):**
```json
{
  "success": false,
  "message": "No messages found with priority 1",
  "errorCode": "MSG_NO_PRIORITY_FOUND"
}
```

**Error Response - Invalid Priority (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "priority",
      "message": "Priority must be 1, 2, or 3"
    }
  ]
}
```

---

### PATCH /message

Update an existing message by sender name.

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "message": "Updated message content"
}
```

**Request Body Parameters:**
- `name` (required): Sender name of message to update (1-255 characters)
- `message` (required): New message content (non-empty string)

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Message updated successfully",
  "data": {
    "entry": "Updated: {1} - [John Doe] says: Updated message content",
    "messageId": 123,
    "name": "John Doe",
    "message": "Updated message content",
    "priority": 1,
    "updatedAt": "2025-09-30T12:30:00.000Z"
  }
}
```

**Error Response - Message Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "No message found for name: John Doe",
  "errorCode": "MSG_NOT_FOUND"
}
```

**Error Response - Validation Failed (400 Bad Request):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "message",
      "message": "Message cannot be empty"
    }
  ]
}
```

**Validation Rules:**
- Name must exist in database
- Name length: 1-255 characters
- Message cannot be empty after trimming
- Priority is NOT changed by this endpoint

---

### DELETE /message?priority={1|2|3}

Delete all messages with a specific priority level.

**Query Parameters:**
- `priority` (required): Priority level to delete (1, 2, or 3)

**Example Request:**
```bash
DELETE /message?priority=1 HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully deleted 3 message(s) with priority 1",
  "data": {
    "entries": [
      "{1} - [John] says: Important task",
      "{1} - [Alice] says: Critical update",
      "{1} - [Bob] says: High priority item"
    ],
    "deletedCount": 3,
    "priority": 1
  }
}
```

**Error Response - No Messages Found (404 Not Found):**
```json
{
  "success": false,
  "message": "No messages found with priority 1",
  "errorCode": "MSG_NO_PRIORITY_FOUND"
}
```

---

### GET /message/all

Retrieve all messages from the database, regardless of priority.

**Example Request:**
```bash
GET /message/all HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved 5 total message(s)",
  "data": {
    "entries": [
      {
        "name": "John",
        "message": "High priority task",
        "priority": 1,
        "formatted": "{1} - [John] says: High priority task"
      },
      {
        "name": "Alice",
        "message": "Medium priority note",
        "priority": 2,
        "formatted": "{2} - [Alice] says: Medium priority note"
      },
      {
        "name": "Bob",
        "message": "Low priority reminder",
        "priority": 3,
        "formatted": "{3} - [Bob] says: Low priority reminder"
      }
    ],
    "totalCount": 5,
    "priorityBreakdown": {
      "priority1": 2,
      "priority2": 1,
      "priority3": 2
    }
  }
}
```

**Notes:**
- Returns empty array if no messages exist
- Includes priority breakdown statistics
- Does not return 404 when no messages exist (returns empty array instead)

---

### GET /message/:name

Retrieve a specific message by sender name.

**Path Parameters:**
- `name` (required): Sender name to look up (1-255 characters)

**Example Request:**
```bash
GET /message/John%20Doe HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved message for 'John Doe'",
  "data": {
    "entry": {
      "name": "John Doe",
      "message": "Hello World",
      "priority": 1
    },
    "formatted": "{1} - [John Doe] says: Hello World"
  }
}
```

**Error Response - Message Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "No message found for name: John Doe",
  "errorCode": "MSG_NOT_FOUND"
}
```

**Notes:**
- Name is case-sensitive
- URL-encode special characters in the name
- Spaces should be encoded as `%20`

---

### DELETE /message/:name

Delete a specific message by sender name.

**Path Parameters:**
- `name` (required): Sender name of message to delete (1-255 characters)

**Example Request:**
```bash
DELETE /message/John%20Doe HTTP/1.1
Host: localhost:4000
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully deleted message for 'John Doe'",
  "data": {
    "entry": "Deleted: {1} - [John Doe] says: Hello World",
    "deletedMessage": {
      "name": "John Doe",
      "message": "Hello World",
      "priority": 1
    }
  }
}
```

**Error Response - Message Not Found (404 Not Found):**
```json
{
  "success": false,
  "message": "No message found for name: John Doe",
  "errorCode": "MSG_NOT_FOUND"
}
```

**Notes:**
- Name is case-sensitive
- URL-encode special characters in the name
- Returns the deleted message data for confirmation

## Getting Started

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit the interactive documentation:
   ```
   http://localhost:4000/api-docs
   ```

3. Test endpoints using the "Try it out" feature in Swagger UI

## Educational Resources

This API demonstrates:
- RESTful API design principles
- HTTP method semantics (GET, POST, PATCH, DELETE)
- Request parameter types (query parameters, path parameters, request body)
- Input validation with express-validator middleware
- Standardized response formats with success/error structures
- Error handling patterns with error codes
- Database operations with PostgreSQL
- API documentation with OpenAPI/Swagger
- Database transactions and connection pooling
- Security best practices (XSS, SQL injection prevention)
- Comprehensive input validation strategies

## Related Documentation

For deeper understanding of the concepts used in this API:

- **[Web Security Guide](http://localhost:4000/docs/web-security-guide.md)** - Security fundamentals (XSS, SQL injection, input validation)
- **[Validation Strategies](http://localhost:4000/docs/validation-strategies.md)** - Comprehensive validation patterns and implementation
- **[Database Fundamentals](http://localhost:4000/docs/database-fundamentals.md)** - Transactions, ACID properties, connection pooling

## Contact

For questions about this educational API, please contact the TCSS-460 course staff.
