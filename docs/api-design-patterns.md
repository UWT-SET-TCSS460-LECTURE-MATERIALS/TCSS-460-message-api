# API Design Patterns

A comprehensive guide to designing professional, scalable, and maintainable APIs.

## Table of Contents

- [RESTful API Design](#restful-api-design)
- [HTTP Status Codes](#http-status-codes)
- [Response Formatting](#response-formatting)
- [Error Handling](#error-handling)
- [API Versioning](#api-versioning)
- [Rate Limiting](#rate-limiting)
- [API Documentation](#api-documentation)

---

## RESTful API Design

### What is REST?

REST (Representational State Transfer) is an architectural style for designing web APIs that use HTTP methods and status codes in a consistent, predictable way.

### REST Principles

1. **Stateless**: Each request contains all information needed to process it
2. **Client-Server**: Clear separation between client and server responsibilities
3. **Cacheable**: Responses should indicate if they can be cached
4. **Uniform Interface**: Consistent resource identification and manipulation
5. **Layered System**: Architecture can have multiple layers (load balancers, caches, etc.)

### HTTP Methods and Their Uses

#### **GET - Retrieve Data**
```http
GET /messages              # Get all messages
GET /messages/123          # Get specific message
GET /messages?priority=1   # Get filtered messages
```

#### **POST - Create Resources**
```http
POST /messages
Content-Type: application/json

{
  "name": "John Doe",
  "message": "Hello World",
  "priority": 1
}
```

#### **PUT - Update/Replace Entire Resource**
```http
PUT /messages/123
Content-Type: application/json

{
  "name": "John Doe",
  "message": "Updated message",
  "priority": 2
}
```

#### **PATCH - Partial Update**
```http
PATCH /messages/123
Content-Type: application/json

{
  "message": "Only updating the message content"
}
```

#### **DELETE - Remove Resources**
```http
DELETE /messages/123       # Delete specific message
DELETE /messages?priority=3 # Delete all low-priority messages
```

### Resource Naming Conventions

#### ✅ **Good Resource Names**
```
GET    /users              # Collection of users
GET    /users/123          # Specific user
GET    /users/123/messages # User's messages (nested resource)
POST   /messages           # Create message
DELETE /messages/456       # Delete specific message
```

#### ❌ **Poor Resource Names**
```
GET    /getUsers           # Verb in URL (use HTTP method instead)
POST   /user              # Singular for collection
GET    /messages/delete    # Action in URL (use DELETE method)
GET    /api/v1/getMessage/123 # Inconsistent naming
```

### Query Parameters for Filtering and Pagination

```http
# Filtering
GET /messages?priority=1&limit=10

# Pagination
GET /messages?page=2&limit=20
GET /messages?offset=40&limit=20

# Sorting
GET /messages?sort=created_at&order=desc

# Searching
GET /messages?search=hello&fields=name,message
```

---

## HTTP Status Codes

### Understanding Status Code Categories

- **1xx**: Informational (rarely used in APIs)
- **2xx**: Success
- **3xx**: Redirection
- **4xx**: Client errors
- **5xx**: Server errors

### Common Success Codes (2xx)

#### **200 OK**
```typescript
// Successful GET, PUT, PATCH
res.status(200).json({
  success: true,
  data: { id: 123, name: "John" }
});
```

#### **201 Created**
```typescript
// Successful POST (resource created)
res.status(201).json({
  success: true,
  data: { id: 456, name: "New User" },
  message: "User created successfully"
});
```

#### **204 No Content**
```typescript
// Successful DELETE (no response body needed)
res.status(204).send();
```

### Common Client Error Codes (4xx)

#### **400 Bad Request**
```typescript
// Invalid request data
res.status(400).json({
  success: false,
  message: "Missing required field: name",
  errorCode: "VALIDATION_ERROR"
});
```

#### **401 Unauthorized**
```typescript
// Authentication required
res.status(401).json({
  success: false,
  message: "Authentication required",
  errorCode: "AUTH_REQUIRED"
});
```

#### **403 Forbidden**
```typescript
// Authenticated but not authorized
res.status(403).json({
  success: false,
  message: "Insufficient permissions",
  errorCode: "INSUFFICIENT_PERMISSIONS"
});
```

#### **404 Not Found**
```typescript
// Resource doesn't exist
res.status(404).json({
  success: false,
  message: "Message not found",
  errorCode: "MESSAGE_NOT_FOUND"
});
```

#### **409 Conflict**
```typescript
// Resource conflict (e.g., duplicate name)
res.status(409).json({
  success: false,
  message: "Name already exists",
  errorCode: "NAME_EXISTS"
});
```

#### **422 Unprocessable Entity**
```typescript
// Valid request format but semantic errors
res.status(422).json({
  success: false,
  message: "Priority must be between 1 and 3",
  errors: [
    { field: "priority", message: "Value out of range" }
  ]
});
```

#### **429 Too Many Requests**
```typescript
// Rate limit exceeded
res.status(429).json({
  success: false,
  message: "Rate limit exceeded",
  retryAfter: 60
});
```

### Common Server Error Codes (5xx)

#### **500 Internal Server Error**
```typescript
// Unexpected server error
res.status(500).json({
  success: false,
  message: "Internal server error",
  errorCode: "INTERNAL_ERROR"
});
```

#### **503 Service Unavailable**
```typescript
// Server temporarily unavailable
res.status(503).json({
  success: false,
  message: "Service temporarily unavailable",
  retryAfter: 300
});
```

---

## Response Formatting

### Consistent Response Structure

Our API uses a consistent response format across all endpoints:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errorCode?: string;
  errors?: any[];
}
```

### Success Response Examples

#### **Simple Success**
```json
{
  "success": true,
  "message": "Operation completed successfully"
}
```

#### **Success with Data**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "entries": [
      {
        "name": "John",
        "message": "Hello",
        "priority": 1,
        "formatted": "{1} - [John] says: Hello"
      }
    ],
    "count": 1,
    "priority": 1
  }
}
```

#### **Collection Response with Metadata**
```json
{
  "success": true,
  "data": {
    "entries": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### Error Response Examples

#### **Validation Error**
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "priority",
      "message": "Priority must be between 1 and 3"
    }
  ]
}
```

#### **Business Logic Error**
```json
{
  "success": false,
  "message": "Name already exists - please choose a different name",
  "errorCode": "MSG_NAME_EXISTS"
}
```

### Response Utilities Implementation

```typescript
// From /src/core/utilities/responseUtils.ts

export const sendSuccess = <T>(
  response: Response,
  data?: T,
  message?: string,
  statusCode: number = 200
): void => {
  const responseBody: ApiResponse<T> = {
    success: true,
    ...(message && { message }),
    ...(data !== undefined && { data })
  };
  response.status(statusCode).json(responseBody);
};

export const sendError = (
  response: Response,
  statusCode: number,
  message: string,
  errorCode?: string,
  errors?: any[]
): void => {
  const responseBody: ApiResponse = {
    success: false,
    message,
    ...(errorCode && { errorCode }),
    ...(errors && { errors })
  };
  response.status(statusCode).json(responseBody);
};
```

---

## Error Handling

### Error Classification

#### **1. Validation Errors (400)**
- Invalid input format
- Missing required fields
- Data type mismatches

```typescript
export const validateCreateMessage = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),

  body('priority')
    .isInt({ min: 1, max: 3 })
    .withMessage('Priority must be an integer between 1 and 3'),

  handleValidationErrors
];
```

#### **2. Business Logic Errors (400, 409)**
- Domain-specific rule violations
- Resource conflicts

```typescript
// Check for duplicate names
const existingUser = await pool.query('SELECT name FROM messages WHERE name = $1', [name]);
if (existingUser.rows.length > 0) {
  return sendError(response, 409, "Name already exists", ErrorCodes.MSG_NAME_EXISTS);
}
```

#### **3. Resource Not Found (404)**
```typescript
if (result.rows.length === 0) {
  return sendError(response, 404, "Message not found", ErrorCodes.MSG_NOT_FOUND);
}
```

#### **4. Server Errors (500)**
```typescript
try {
  // Database operations
} catch (error) {
  console.error('Database error:', error);
  return sendError(response, 500, "Internal server error", ErrorCodes.INTERNAL_ERROR);
}
```

### Global Error Handler

```typescript
// Global error middleware
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', error);

  if (error instanceof SyntaxError && 'body' in error) {
    return sendError(res, 400, "Invalid JSON format", ErrorCodes.INVALID_JSON);
  }

  sendError(res, 500, "Internal server error", ErrorCodes.INTERNAL_ERROR);
});
```

---

## API Versioning

### Why Version APIs?

- **Breaking Changes**: Modify existing endpoints without breaking existing clients
- **Feature Evolution**: Add new features while maintaining backward compatibility
- **Client Migration**: Allow gradual migration to new API versions

### Versioning Strategies

#### **1. URL Path Versioning**
```
/api/v1/messages
/api/v2/messages
```

#### **2. Header Versioning**
```http
GET /api/messages
Accept: application/vnd.api.v1+json
```

#### **3. Query Parameter Versioning**
```
/api/messages?version=1
```

### Implementation Example

```typescript
// Route versioning
app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

// Version-specific controllers
export const v1MessageController = {
  // Legacy response format
  getMessages: (req, res) => {
    res.json({ messages: [...] });
  }
};

export const v2MessageController = {
  // New response format with metadata
  getMessages: (req, res) => {
    res.json({
      success: true,
      data: { entries: [...], metadata: {...} }
    });
  }
};
```

---

## Rate Limiting

### Why Rate Limiting?

- **Prevent Abuse**: Stop malicious users from overwhelming your API
- **Ensure Fair Usage**: Prevent single users from consuming all resources
- **Protect Infrastructure**: Maintain service quality for all users

### Implementation with Express

```typescript
import rateLimit from 'express-rate-limit';

// General rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later",
    errorCode: "RATE_LIMIT_EXCEEDED"
  }
});

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/', generalLimiter);
app.use('/api/auth/', authLimiter);
```

### Rate Limit Headers

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200

HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1640995200
Retry-After: 900
```

---

## API Documentation

### OpenAPI/Swagger Documentation

```yaml
# Example OpenAPI specification
openapi: 3.0.0
info:
  title: Message API
  version: 1.0.0
  description: Educational API for managing messages

paths:
  /messages:
    get:
      summary: Get all messages
      parameters:
        - name: priority
          in: query
          schema:
            type: integer
            minimum: 1
            maximum: 3
      responses:
        200:
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/MessageListResponse'

    post:
      summary: Create a new message
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MessageRequest'
      responses:
        201:
          description: Message created successfully

components:
  schemas:
    MessageRequest:
      type: object
      required:
        - name
        - message
        - priority
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 100
        message:
          type: string
          minLength: 1
        priority:
          type: integer
          minimum: 1
          maximum: 3
```

### Documentation Best Practices

1. **Clear Descriptions**: Explain what each endpoint does
2. **Example Requests/Responses**: Show realistic usage
3. **Error Scenarios**: Document all possible error responses
4. **Authentication**: Explain how to authenticate requests
5. **Rate Limits**: Document rate limiting policies

---

## API Testing

### Testing Strategies

#### **1. Unit Tests**
```typescript
describe('Message Controller', () => {
  it('should create a message successfully', async () => {
    const mockRequest = {
      body: { name: 'Test', message: 'Hello', priority: 1 }
    };
    const mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await createMessage(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
```

#### **2. Integration Tests**
```typescript
describe('Message API Integration', () => {
  it('should handle complete message workflow', async () => {
    // Create message
    const createResponse = await request(app)
      .post('/api/messages')
      .send({ name: 'Test', message: 'Hello', priority: 1 })
      .expect(201);

    // Retrieve message
    const getResponse = await request(app)
      .get('/api/messages?priority=1')
      .expect(200);

    expect(getResponse.body.data.entries).toHaveLength(1);
  });
});
```

#### **3. API Contract Tests**
```typescript
// Verify API responses match OpenAPI specification
import { validateResponse } from 'openapi-response-validator';

const validator = validateResponse({
  responses: {
    200: {
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/MessageResponse' }
        }
      }
    }
  }
});

const validationResult = validator.validateResponse(200, response);
expect(validationResult.errors).toHaveLength(0);
```

---

## Performance Considerations

### Caching Strategies

```typescript
import redis from 'redis';
const cache = redis.createClient();

// Cache frequently accessed data
app.get('/api/messages', async (req, res) => {
  const cacheKey = `messages:${JSON.stringify(req.query)}`;

  // Try cache first
  const cached = await cache.get(cacheKey);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Fetch from database
  const messages = await getMessagesFromDB(req.query);

  // Cache result
  await cache.setex(cacheKey, 300, JSON.stringify(messages)); // 5 min cache

  res.json(messages);
});
```

### Database Query Optimization

```typescript
// ✅ GOOD: Specific queries with indexes
const messages = await pool.query(
  'SELECT name, message, priority FROM messages WHERE priority = $1 ORDER BY created_at',
  [priority]
);

// ✅ GOOD: Pagination for large datasets
const messages = await pool.query(
  'SELECT * FROM messages ORDER BY created_at LIMIT $1 OFFSET $2',
  [limit, offset]
);
```

---

## Further Reading

- [REST API Design Best Practices](https://restfulapi.net/) - Comprehensive REST guide
- [HTTP Status Codes](https://httpstatuses.com/) - Complete status code reference
- [OpenAPI Specification](https://swagger.io/specification/) - API documentation standard

---

*Well-designed APIs are the foundation of scalable, maintainable web applications. Following these patterns ensures consistency, reliability, and developer-friendly experiences.*