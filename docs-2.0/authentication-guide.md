# API Authentication Guide

A comprehensive educational guide comparing API key authentication and JWT (JSON Web Tokens) for TCSS-460 students.

> **💡 Related Code**: See implementations in [`/src/core/middleware/apiKeyAuth.ts`](../src/core/middleware/apiKeyAuth.ts), [`/src/controllers/apiKeyController.ts`](../src/controllers/apiKeyController.ts), and [`/src/routes/closed/`](../src/routes/closed/)

## Quick Navigation
- 🔑 **API Key Generation**: [`/api-key`](http://localhost:4000/api-key) - Get your API key
- 🛡️ **Protected Endpoints**: [`/protected/message/*`](http://localhost:4000/api-docs) - Authenticated message operations
- 📝 **Authentication Middleware**: [`apiKeyAuth.ts`](../src/core/middleware/apiKeyAuth.ts) - API key validation
- 🔧 **Key Utilities**: [`apiKeyUtils.ts`](../src/core/utilities/apiKeyUtils.ts) - UUID generation and validation
- 📚 **Swagger Docs**: [API Documentation](http://localhost:4000/api-docs) - Interactive API testing
- 🔒 **Security**: [Web Security Guide](./web-security-guide.md#authentication-vs-authorization) - Authentication security concepts

## Table of Contents

- [Introduction to API Authentication](#introduction-to-api-authentication)
- [API Keys Deep Dive](#api-keys-deep-dive)
- [JWT (JSON Web Tokens) Deep Dive](#jwt-json-web-tokens-deep-dive)
- [Side-by-Side Comparison](#side-by-side-comparison)
- [When to Use Which](#when-to-use-which)
- [Implementation Examples](#implementation-examples)
- [Hands-On Exercises](#hands-on-exercises)

---

## Introduction to API Authentication

### Why APIs Need Authentication

APIs often expose sensitive data or operations that should be restricted to authorized users. Without authentication, anyone could:

- Access private user data
- Modify or delete resources
- Consume expensive computational resources
- Launch denial-of-service attacks

**Authentication verifies identity**: "Who are you?"
**Authorization determines permissions**: "What can you do?"

### Common Authentication Methods

1. **API Keys** - Simple string tokens stored in database (stateful)
2. **JWT** - Self-contained signed tokens (stateless)
3. **OAuth 2.0** - Delegated authorization framework (used by Google, GitHub)
4. **Basic Auth** - Username/password in headers (rarely used alone)
5. **Session Cookies** - Server-side sessions (traditional web apps)

This guide focuses on **API Keys** (implemented in this project) and **JWT** (comparison reference).

---

## API Keys Deep Dive

### What Are API Keys?

API keys are **unique identifiers** (typically UUIDs or random strings) assigned to users or applications to authenticate API requests.

**Key Characteristics:**
- Long random strings (e.g., UUID v4: `550e8400-e29b-41d4-a716-446655440000`)
- Stored in database with associated metadata
- Sent in HTTP headers (e.g., `X-API-Key`)
- Validated by querying database on each request

### How API Keys Work (This Project)

#### **1. Key Generation** (`POST /api-key`)

```typescript
// src/controllers/apiKeyController.ts
import { randomUUID } from 'crypto';

export const generateApiKeyController = async (request: Request, response: Response) => {
    const { name, email } = request.body;
    const apiKey = randomUUID(); // Generates UUID v4

    // Store in database with metadata
    await pool.query(
        `INSERT INTO api_keys (api_key, name, email, is_active, created_at, request_count)
         VALUES ($1, $2, $3, true, CURRENT_TIMESTAMP, 0)`,
        [apiKey, name, email]
    );

    // Return key to user (shown only once!)
    return { api_key: apiKey, created_at: new Date(), name };
};
```

**What happens:**
1. User submits name and email
2. Server generates cryptographically secure UUID v4
3. Key is stored in `api_keys` table with metadata
4. Key is returned to user (displayed only once - must be saved!)

#### **2. Key Authentication** (`X-API-Key` header)

```typescript
// src/core/middleware/apiKeyAuth.ts
export const apiKeyAuth = async (request: Request, response: Response, next: NextFunction) => {
    // 1. Extract key from header
    const apiKey = request.headers['x-api-key'];

    // 2. Validate format (UUID v4)
    if (!isValidApiKeyFormat(apiKey)) {
        return sendError(response, 401, 'Invalid API key format', 'AUTH_KEY_INVALID');
    }

    // 3. Query database for key
    const result = await pool.query(
        'SELECT id, api_key, name, email, is_active FROM api_keys WHERE api_key = $1',
        [apiKey]
    );

    // 4. Check if key exists and is active
    if (result.rows.length === 0 || !result.rows[0].is_active) {
        return sendError(response, 401, 'Invalid or revoked API key', 'AUTH_KEY_INVALID');
    }

    // 5. Update usage tracking
    await pool.query(
        'UPDATE api_keys SET last_used_at = CURRENT_TIMESTAMP, request_count = request_count + 1 WHERE id = $1',
        [result.rows[0].id]
    );

    // 6. Attach key metadata to request and continue
    request.apiKey = { id: result.rows[0].id, name: result.rows[0].name };
    next();
};
```

**Request Flow:**
```
Client Request
     ↓
Headers: { "X-API-Key": "550e8400-..." }
     ↓
API Key Middleware
     ↓
Database Lookup (SELECT WHERE api_key = ?)
     ↓
Valid & Active? → Update Metrics → Continue
     ↓
Protected Controller
     ↓
Response
```

#### **3. Protected Endpoints**

```bash
# Without API key (fails)
curl http://localhost:4000/protected/message/all
# → 401 Unauthorized: "API key required - visit /api-key to generate one"

# With valid API key (succeeds)
curl -H "X-API-Key: 550e8400-e29b-41d4-a716-446655440000" \
     http://localhost:4000/protected/message/all
# → 200 Success: { "success": true, "data": { "entries": [...], "count": 15 } }
```

### API Key Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ 1. GENERATION                                           │
│    User visits /api-key → Submits name/email           │
│    Server generates UUID → Stores in DB → Returns key  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. USAGE                                                │
│    User includes key in X-API-Key header                │
│    Server validates key → Logs usage → Grants access   │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. REVOCATION (Optional)                                │
│    Admin sets is_active = false in database             │
│    Future requests with this key → 401 Unauthorized    │
└─────────────────────────────────────────────────────────┘
```

### API Key Security Considerations

**✅ Advantages:**
- Simple to implement and understand
- Easy to revoke (update database flag)
- Request tracking built-in (last_used_at, request_count)
- No client-side cryptography required

**⚠️ Security Risks:**
- **No expiration** - Keys valid forever unless manually revoked
- **Database dependency** - Every request requires DB query (performance impact)
- **Theft risk** - If leaked, valid until manually revoked
- **No user identity** - Keys identify applications, not specific users

**🔒 Best Practices:**
- **HTTPS only** - Never send keys over unencrypted HTTP
- **Environment variables** - Never hardcode keys in source code
- **Rate limiting** - Prevent abuse from compromised keys
- **Key rotation** - Periodically regenerate keys
- **Monitoring** - Track usage patterns to detect anomalies

---

## JWT (JSON Web Tokens) Deep Dive

### What Are JWTs?

JWTs are **self-contained, cryptographically signed tokens** that encode user identity and claims. Unlike API keys, JWTs don't require database lookups for validation.

**Key Characteristics:**
- Base64-encoded JSON with cryptographic signature
- Contain user claims (identity, permissions, expiration)
- Stateless (server doesn't store them)
- Typically sent in `Authorization: Bearer <token>` header

### JWT Structure

A JWT consists of three parts separated by dots (`.`):

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

    HEADER             .          PAYLOAD           .        SIGNATURE
```

#### **1. Header** (Algorithm and Token Type)
```json
{
  "alg": "HS256",  // Signing algorithm (HMAC SHA-256)
  "typ": "JWT"     // Token type
}
```

#### **2. Payload** (Claims - User Data)
```json
{
  "sub": "1234567890",        // Subject (user ID)
  "name": "John Doe",         // Custom claim
  "email": "john@example.com", // Custom claim
  "iat": 1516239022,          // Issued at (timestamp)
  "exp": 1516242622           // Expiration (timestamp)
}
```

**Standard Claims:**
- `sub` (subject) - User identifier
- `iat` (issued at) - Timestamp when token was created
- `exp` (expiration) - Timestamp when token expires
- `iss` (issuer) - Who created the token
- `aud` (audience) - Who the token is intended for

#### **3. Signature** (Cryptographic Verification)
```javascript
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

The signature ensures the token hasn't been tampered with. Only the server with the secret key can create valid signatures.

### How JWT Works (Conceptual)

#### **1. JWT Generation** (Login/Authentication)

```typescript
// Conceptual example (not in this project - see credentialing server)
import jwt from 'jsonwebtoken';

const generateJWT = (user) => {
    const payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expires in 1 hour
    };

    const secret = process.env.JWT_SECRET; // Stored securely
    const token = jwt.sign(payload, secret, { algorithm: 'HS256' });

    return token;
};
```

**What happens:**
1. User logs in with username/password
2. Server verifies credentials against database
3. Server generates JWT with user claims
4. JWT is signed with secret key
5. Token is returned to client (stored in localStorage or cookie)

#### **2. JWT Authentication** (`Authorization: Bearer` header)

```typescript
// Conceptual JWT middleware (not in this project)
import jwt from 'jsonwebtoken';

export const jwtAuth = (request, response, next) => {
    // 1. Extract token from Authorization header
    const authHeader = request.headers.authorization; // "Bearer eyJhbGc..."
    const token = authHeader?.split(' ')[1]; // Extract token after "Bearer "

    if (!token) {
        return sendError(response, 401, 'JWT required');
    }

    try {
        // 2. Verify signature and decode payload (NO DATABASE QUERY!)
        const secret = process.env.JWT_SECRET;
        const decoded = jwt.verify(token, secret);

        // 3. Check expiration (handled automatically by jwt.verify)
        // If expired, jwt.verify throws TokenExpiredError

        // 4. Attach user info to request
        request.user = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(response, 401, 'JWT expired');
        }
        return sendError(response, 401, 'Invalid JWT');
    }
};
```

**Request Flow:**
```
Client Request
     ↓
Headers: { "Authorization": "Bearer eyJhbGc..." }
     ↓
JWT Middleware
     ↓
Verify Signature (NO DATABASE QUERY!)
     ↓
Valid & Not Expired? → Decode Claims → Continue
     ↓
Protected Controller
     ↓
Response
```

#### **3. Protected Endpoints with JWT**

```bash
# Without JWT (fails)
curl http://auth-server:3000/api/users
# → 401 Unauthorized: "JWT required"

# With valid JWT (succeeds)
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
     http://auth-server:3000/api/users
# → 200 Success: { "users": [...] }
```

### JWT Lifecycle

```
┌─────────────────────────────────────────────────────────┐
│ 1. ISSUANCE (Login)                                     │
│    User logs in → Server verifies credentials          │
│    Server generates JWT → Signs with secret → Returns  │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 2. USAGE                                                │
│    User includes JWT in Authorization header            │
│    Server verifies signature → Checks expiration       │
│    If valid → Decode claims → Grant access             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│ 3. EXPIRATION (Automatic)                               │
│    JWT expires after defined time (e.g., 1 hour)        │
│    User must re-authenticate to get new JWT             │
└─────────────────────────────────────────────────────────┘
```

### JWT Security Considerations

**✅ Advantages:**
- **Stateless** - No database lookups required (scales easily)
- **Built-in expiration** - Tokens automatically expire
- **Self-contained** - All claims encoded in token
- **Standard** - RFC 7519, widely supported

**⚠️ Security Risks:**
- **Cannot be revoked** - Valid until expiration (unless using blacklist)
- **Theft risk** - If stolen, valid until expiration
- **Size** - Larger than API keys (sent with every request)
- **Secret management** - Compromised secret invalidates all tokens

**🔒 Best Practices:**
- **Short expiration** - Use refresh tokens for long sessions
- **HTTPS only** - Never send JWTs over unencrypted HTTP
- **Secure storage** - httpOnly cookies or secure localStorage
- **Audience validation** - Verify `aud` claim to prevent token reuse
- **Algorithm verification** - Prevent algorithm confusion attacks

---

## Side-by-Side Comparison

### Feature Comparison Table

| Feature | API Keys (This Project) | JWT (Conceptual) |
|---------|-------------------------|------------------|
| **Storage** | Database (api_keys table) | Self-contained token |
| **State** | Stateful (DB lookup) | Stateless (verify signature) |
| **Validation** | Query database on each request | Verify cryptographic signature |
| **Performance** | DB query per request (~10-50ms) | No DB query (~1ms) |
| **Scalability** | Limited by database capacity | Highly scalable (no DB) |
| **Revocation** | Easy (update `is_active = false`) | Difficult (need blacklist or short expiration) |
| **Expiration** | Manual (no built-in expiration) | Automatic (`exp` claim) |
| **Size** | ~36 characters (UUID) | ~200-500 characters (encoded JSON) |
| **Metadata** | Stored in database | Encoded in token payload |
| **Use Case** | Service APIs, internal tools | User sessions, distributed systems |
| **Complexity** | Simple to implement | More complex (crypto, claims) |
| **Security Model** | Shared secret in DB | Signed with secret key |
| **Request Tracking** | Built-in (last_used_at, request_count) | Requires separate analytics |
| **Header** | `X-API-Key: <uuid>` | `Authorization: Bearer <jwt>` |
| **Standards** | No formal standard (custom) | RFC 7519 (industry standard) |

### Pros and Cons

#### **API Keys**

**✅ Pros:**
- **Simplicity** - Easy to understand and implement
- **Revocation** - Instantly revoke access by updating database
- **Request tracking** - Built-in usage analytics (last_used_at, request_count)
- **Flexibility** - Easy to add custom metadata (email, name, permissions)
- **No client complexity** - Just send UUID in header

**❌ Cons:**
- **Database dependency** - Every request requires DB query (performance bottleneck)
- **No expiration** - Keys valid forever unless manually revoked
- **Scalability** - Database can become bottleneck with high traffic
- **Single point of failure** - Database outage = authentication failure
- **Manual rotation** - No built-in key rotation

#### **JWT**

**✅ Pros:**
- **Stateless** - No database lookups (scales horizontally)
- **Built-in expiration** - Tokens automatically expire (`exp` claim)
- **Self-contained** - All user info in token (no DB queries for user data)
- **Standard** - RFC 7519 widely supported across languages/frameworks
- **Microservices-friendly** - Shared secret allows distributed validation

**❌ Cons:**
- **Cannot revoke** - Valid until expiration (unless using token blacklist)
- **Larger size** - 200-500 bytes vs 36 bytes for UUID
- **Secret management** - Compromised secret invalidates all tokens
- **Complexity** - Requires understanding of cryptography (HMAC, RSA)
- **Payload exposure** - Base64-encoded, not encrypted (don't store sensitive data)

---

## When to Use Which

### Use API Keys When:

1. **Service-to-service authentication** - Backend services calling your API
2. **Simple access control** - Basic "is this request authorized?" check
3. **Long-lived credentials** - Keys used for months/years without rotation
4. **Request tracking required** - Need analytics on key usage (last_used_at, request_count)
5. **Easy revocation needed** - Must be able to instantly disable access
6. **Small-scale APIs** - Lower traffic where DB lookups are acceptable
7. **Internal tools** - Admin dashboards, internal microservices

**Real-World Examples:**
- **Google Maps API** - API keys for geolocation services
- **Stripe API** - Secret keys for payment processing
- **SendGrid** - API keys for email sending
- **GitHub Personal Access Tokens** - API keys for GitHub API
- **AWS Access Keys** - Service authentication (though AWS also uses signatures)

### Use JWT When:

1. **User authentication** - Individual users logging into web/mobile apps
2. **Distributed systems** - Microservices that need to validate tokens independently
3. **Stateless scaling** - High-traffic apps needing horizontal scaling
4. **Short-lived sessions** - Tokens expire after minutes/hours
5. **Mobile apps** - Native apps that store tokens locally
6. **Single Sign-On (SSO)** - Share authentication across multiple domains
7. **Third-party authorization** - OAuth 2.0, social login (Google, Facebook)

**Real-World Examples:**
- **Auth0** - Identity-as-a-service using JWT
- **Firebase Authentication** - User sessions with JWT
- **Okta** - Enterprise SSO with JWT
- **OAuth 2.0** - Access tokens often implemented as JWT
- **Amazon Cognito** - AWS user authentication with JWT

### Hybrid Approaches

Many production systems use **both**:

```
┌─────────────────────────────────────────────────────┐
│ User Authentication (JWT)                           │
│ - Users log in with username/password              │
│ - Receive JWT with 1-hour expiration               │
│ - Use JWT for session management                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Service Authentication (API Keys)                   │
│ - Backend services use long-lived API keys         │
│ - Keys stored in environment variables             │
│ - Used for server-to-server communication          │
└─────────────────────────────────────────────────────┘
```

**Example: Stripe**
- **Publishable Key** (public, client-side) - Create payment forms
- **Secret Key** (private, server-side) - Complete charges (API key style)
- **JWT** (for Connect platform) - Delegated access between accounts

---

## Implementation Examples

### API Key Implementation (This Project)

#### **Database Schema**

```sql
-- data/init.sql
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(64) UNIQUE NOT NULL,         -- UUID v4
    name VARCHAR(255) NOT NULL,                  -- User/service name
    email VARCHAR(255),                          -- Contact email
    is_active BOOLEAN DEFAULT true,              -- Revocation flag
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,       -- Usage tracking
    request_count INTEGER DEFAULT 0              -- Analytics
);

CREATE INDEX idx_api_keys_key ON api_keys(api_key);       -- Fast lookups
CREATE INDEX idx_api_keys_active ON api_keys(is_active);  -- Filter active keys
```

#### **Key Generation Utility**

```typescript
// src/core/utilities/apiKeyUtils.ts
import { randomUUID } from 'crypto';

/**
 * Generates a cryptographically secure API key using UUID v4
 * @returns A UUID v4 string (e.g., "550e8400-e29b-41d4-a716-446655440000")
 */
export const generateApiKey = (): string => {
    return randomUUID(); // Uses crypto.randomBytes() internally
};

/**
 * Validates that a string is a properly formatted UUID v4
 * @param key - The API key to validate
 * @returns True if key matches UUID v4 format
 */
export const isValidApiKeyFormat = (key: string): boolean => {
    const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Pattern.test(key);
};
```

#### **Authentication Middleware**

```typescript
// src/core/middleware/apiKeyAuth.ts
import { Request, Response, NextFunction } from 'express';
import { pool } from '@utilities/database';
import { isValidApiKeyFormat } from '@utilities/apiKeyUtils';

export const apiKeyAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    // 1. Extract API key from X-API-Key header
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
        sendError(response, 401, 'API key required - visit /api-key to generate one', 'AUTH_KEY_REQUIRED');
        return;
    }

    // 2. Validate UUID format (fast client-side check before DB query)
    if (!isValidApiKeyFormat(apiKey)) {
        sendError(response, 401, 'Invalid API key format - must be a valid UUID', 'AUTH_KEY_INVALID');
        return;
    }

    try {
        // 3. Query database for key (includes active status check)
        const result = await pool.query<ApiKeyRecord>(
            'SELECT id, api_key, name, email, is_active FROM api_keys WHERE api_key = $1',
            [apiKey]
        );

        // 4. Verify key exists
        if (result.rows.length === 0) {
            sendError(response, 401, 'Invalid API key - please check your key or generate a new one', 'AUTH_KEY_INVALID');
            return;
        }

        const keyRecord = result.rows[0];

        // 5. Check if key is active (revocation check)
        if (!keyRecord.is_active) {
            sendError(response, 401, 'API key has been revoked - please generate a new one', 'AUTH_KEY_REVOKED');
            return;
        }

        // 6. Update usage tracking (async, don't await to avoid slowing response)
        pool.query(
            `UPDATE api_keys
             SET last_used_at = CURRENT_TIMESTAMP,
                 request_count = request_count + 1
             WHERE id = $1`,
            [keyRecord.id]
        ).catch(error => console.error('Failed to update API key usage:', error));

        // 7. Attach key metadata to request for use in controllers
        const authenticatedReq = request as AuthenticatedRequest;
        authenticatedReq.apiKey = {
            id: keyRecord.id,
            name: keyRecord.name,
            email: keyRecord.email
        };

        next();
    } catch (error) {
        console.error('API key authentication error:', error);
        sendError(response, 500, 'Internal server error during authentication', 'AUTH_ERROR');
    }
};
```

#### **Protected Route Configuration**

```typescript
// src/routes/closed/messageRoutes.ts
import { Router } from 'express';
import { apiKeyAuth } from '@middleware/apiKeyAuth';
import { getAllMessages } from '@controllers/messageController';

export const protectedMessageRoutes = Router();

// Apply API key authentication to ALL routes in this router
protectedMessageRoutes.use(apiKeyAuth);

// Protected endpoint - requires valid X-API-Key header
protectedMessageRoutes.get('/all', getAllMessages);
```

#### **Usage Example**

```bash
# 1. Generate API key
curl -X POST http://localhost:4000/api-key \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# Response:
# {
#   "success": true,
#   "message": "API key generated successfully - save this key, it won't be shown again!",
#   "data": {
#     "api_key": "550e8400-e29b-41d4-a716-446655440000",
#     "name": "John Doe",
#     "created_at": "2024-01-15T10:30:00.000Z"
#   }
# }

# 2. Use API key to access protected endpoint
curl -H "X-API-Key: 550e8400-e29b-41d4-a716-446655440000" \
     http://localhost:4000/protected/message/all

# Response:
# {
#   "success": true,
#   "data": {
#     "entries": [ /* messages */ ],
#     "count": 15
#   },
#   "timestamp": "2024-01-15T10:31:00.000Z"
# }
```

### JWT Implementation (Conceptual Reference)

For a complete JWT implementation, refer to the **credentialing server** project. Here's a simplified conceptual example:

```typescript
// Conceptual JWT middleware (not in this project)
import jwt from 'jsonwebtoken';

// Generate JWT (login endpoint)
export const login = async (request, response) => {
    const { username, password } = request.body;

    // Verify credentials (database lookup)
    const user = await getUserByUsername(username);
    if (!user || !await verifyPassword(password, user.password_hash)) {
        return sendError(response, 401, 'Invalid credentials');
    }

    // Generate JWT with claims
    const payload = {
        sub: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256' });

    response.json({
        success: true,
        data: { token, expiresIn: 3600 }
    });
};

// Verify JWT (authentication middleware)
export const jwtAuth = (request, response, next) => {
    const authHeader = request.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return sendError(response, 401, 'JWT required');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        request.user = { id: decoded.sub, name: decoded.name, role: decoded.role };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(response, 401, 'JWT expired');
        }
        return sendError(response, 401, 'Invalid JWT');
    }
};
```

---

## Hands-On Exercises

### Exercise 1: Generate and Test API Key

**Objective**: Understand the full API key lifecycle.

1. **Generate an API key**:
   - Visit http://localhost:4000/api-key in your browser
   - Fill out the form with your name and email
   - Click "Generate API Key" and copy the key

2. **Test without authentication**:
   ```bash
   curl http://localhost:4000/protected/message/all
   ```
   **Expected**: 401 Unauthorized with error code `AUTH_KEY_REQUIRED`

3. **Test with valid key**:
   ```bash
   curl -H "X-API-Key: YOUR_KEY_HERE" \
        http://localhost:4000/protected/message/all
   ```
   **Expected**: 200 Success with list of messages

4. **Test with invalid key**:
   ```bash
   curl -H "X-API-Key: invalid-key-123" \
        http://localhost:4000/protected/message/all
   ```
   **Expected**: 401 Unauthorized with error code `AUTH_KEY_INVALID`

5. **Examine database**:
   ```sql
   -- Connect to database
   docker exec -it tcss-460-message-api-postgres-1 psql -U postgres -d postgres

   -- View your API key record
   SELECT api_key, name, email, is_active, created_at, last_used_at, request_count
   FROM api_keys
   WHERE name = 'Your Name';
   ```
   **Observe**: Notice `last_used_at` updated and `request_count` incremented

### Exercise 2: Compare Public vs Protected Endpoints

**Objective**: Understand the difference between public and protected APIs.

1. **Test public endpoint** (no authentication required):
   ```bash
   curl http://localhost:4000/message/all
   ```
   **Expected**: 200 Success (no API key needed)

2. **Test protected endpoint** (authentication required):
   ```bash
   curl http://localhost:4000/protected/message/all
   ```
   **Expected**: 401 Unauthorized

3. **Compare in Swagger UI**:
   - Visit http://localhost:4000/api-docs
   - Find `GET /message/all` (Messages tag) - No lock icon
   - Find `GET /protected/message/all` (Protected Messages tag) - Lock icon 🔒
   - Click "Authorize" button, enter your API key
   - Try both endpoints in Swagger UI

**Question**: Why would you offer both public and protected versions of the same endpoint?
**Answer**: Educational demonstration. Real-world scenarios might be:
- Public endpoint with rate limiting (100 req/hour)
- Protected endpoint with higher limits (10,000 req/hour)
- Public endpoint with cached/delayed data
- Protected endpoint with real-time data

### Exercise 3: API Key Revocation

**Objective**: Learn how to revoke access instantly.

1. **Generate a second API key** (using the form or curl)

2. **Test the new key works**:
   ```bash
   curl -H "X-API-Key: NEW_KEY_HERE" \
        http://localhost:4000/protected/message/all
   ```
   **Expected**: 200 Success

3. **Revoke the key in database**:
   ```sql
   UPDATE api_keys
   SET is_active = false
   WHERE api_key = 'NEW_KEY_HERE';
   ```

4. **Test revoked key**:
   ```bash
   curl -H "X-API-Key: NEW_KEY_HERE" \
        http://localhost:4000/protected/message/all
   ```
   **Expected**: 401 Unauthorized with error code `AUTH_KEY_REVOKED`

**Reflection**: How does this compare to JWT? Can you revoke a JWT instantly?
**Answer**: No! JWTs are valid until expiration. You'd need a token blacklist (database of revoked tokens), which defeats the stateless advantage.

### Exercise 4: Request Tracking and Analytics

**Objective**: Understand built-in usage analytics.

1. **Make multiple requests** with your API key (10+ times):
   ```bash
   for i in {1..10}; do
     curl -H "X-API-Key: YOUR_KEY_HERE" \
          http://localhost:4000/protected/message/all
     sleep 1
   done
   ```

2. **Check usage metrics**:
   ```sql
   SELECT name, request_count, last_used_at, created_at
   FROM api_keys
   WHERE api_key = 'YOUR_KEY_HERE';
   ```
   **Observe**: `request_count` incremented to 10+, `last_used_at` shows recent timestamp

3. **Calculate usage rate**:
   ```sql
   SELECT
       name,
       request_count,
       EXTRACT(EPOCH FROM (last_used_at - created_at)) / 60 AS minutes_active,
       ROUND(request_count / NULLIF(EXTRACT(EPOCH FROM (last_used_at - created_at)) / 60, 0), 2) AS requests_per_minute
   FROM api_keys
   WHERE api_key = 'YOUR_KEY_HERE';
   ```

**Question**: How would you implement rate limiting based on this data?
**Answer**: Add a `daily_request_limit` column, check `request_count` in middleware, reset counter daily with a cron job.

### Exercise 5: Compare Performance (Advanced)

**Objective**: Measure the performance cost of database lookups.

1. **Test API key performance** (with database query):
   ```bash
   time for i in {1..100}; do
     curl -s -H "X-API-Key: YOUR_KEY_HERE" \
          http://localhost:4000/protected/message/all > /dev/null
   done
   ```
   **Record time**: ~X seconds for 100 requests

2. **Test public endpoint performance** (no authentication):
   ```bash
   time for i in {1..100}; do
     curl -s http://localhost:4000/message/all > /dev/null
   done
   ```
   **Record time**: ~Y seconds for 100 requests

3. **Calculate overhead**:
   ```
   Authentication overhead = (X - Y) / 100 seconds per request
   ```

**Reflection**: In production with thousands of requests per second, how would this scale?
**Answer**: Database becomes bottleneck. Solutions:
- Redis caching of API keys (check cache before DB)
- Connection pooling (already implemented with `pg` pool)
- Read replicas for database scaling
- Or switch to stateless JWT to eliminate DB queries

### Exercise 6: Cross-Reference with JWT (Conceptual)

**Objective**: Understand how JWT differs from API keys.

1. **Decode a sample JWT** (using online tool: https://jwt.io):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   ```

2. **Observe the payload**:
   ```json
   {
     "sub": "1234567890",
     "name": "John Doe",
     "iat": 1516239022,
     "exp": 1516242622
   }
   ```

3. **Compare to API key database record**:
   ```sql
   SELECT id, api_key, name, email, created_at
   FROM api_keys
   WHERE api_key = 'YOUR_KEY_HERE';
   ```

**Question**: Where is the user data stored in each approach?
- **API Key**: Database (requires query to retrieve)
- **JWT**: Token payload (self-contained, no query needed)

**Question**: How does each approach handle expiration?
- **API Key**: No expiration (manual revocation via `is_active`)
- **JWT**: Automatic expiration (`exp` claim checked during verification)

---

## Summary

### Key Takeaways

1. **API Keys (Stateful)**:
   - Simple, database-backed authentication
   - Easy revocation and usage tracking
   - Best for service-to-service communication
   - Performance limited by database queries

2. **JWT (Stateless)**:
   - Self-contained, cryptographically signed tokens
   - No database queries for validation
   - Built-in expiration and claims
   - Best for user sessions and distributed systems

3. **Choose based on requirements**:
   - Need revocation? → API Keys
   - Need scalability? → JWT
   - Need usage analytics? → API Keys
   - Need distributed validation? → JWT
   - Simple internal tool? → API Keys
   - User authentication app? → JWT

### Further Learning

- **Explore this project's implementation**:
  - [`/src/core/middleware/apiKeyAuth.ts`](../src/core/middleware/apiKeyAuth.ts) - Authentication middleware
  - [`/src/controllers/apiKeyController.ts`](../src/controllers/apiKeyController.ts) - Key generation logic
  - [`/data/init.sql`](../data/init.sql) - Database schema

- **Compare with JWT**:
  - Reference the credentialing server project for JWT implementation
  - Read RFC 7519 (JWT specification): https://tools.ietf.org/html/rfc7519
  - Explore Auth0 documentation: https://auth0.com/docs/tokens/json-web-tokens

- **Security deep dive**:
  - [Web Security Guide](./web-security-guide.md#authentication-vs-authorization) - Authentication security
  - OWASP API Security Top 10: https://owasp.org/www-project-api-security/

### Related Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Full API reference
- [Web Security Guide](./web-security-guide.md) - Security best practices
- [Database Fundamentals](./database-fundamentals.md) - Database design patterns
- [Environment Configuration](./environment-configuration.md) - Managing secrets

---

**Questions or feedback?** Reach out to cfb3@uw.edu or visit office hours!

**Happy learning! 🚀**
