# API Key Authentication Implementation Plan

Educational implementation of simple API key authentication for protected message routes.

---

## Overview

### What We'll Build:
1. **API Key Generation Page** - Simple web form at `/api-key` to get a key
2. **Database Storage** - Store API keys with metadata (name, email, created date)
3. **Validation Middleware** - Check `X-API-Key` header on protected routes
4. **Protected Routes** - Duplicate all message routes under `/protected/message/*`
5. **Swagger Documentation** - Show both public and protected endpoints

---

## Detailed Implementation Plan

### **Step 1: Database Schema**
✅ **COMPLETED** - Added to `data/init.sql`

The `api_keys` table has been integrated into the main database initialization script.

**Table: `api_keys`**
```sql
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active);
```

**Why this design?**
- Simple UUID-based keys (not JWT - as requested)
- Track usage (educational: show request counting)
- Can revoke keys with `is_active` flag
- Metadata for learning (name, email, timestamps)

**To apply the new schema:**
Delete the old database volume and rebuild using `docker compose down`, `docker volume rm tcss-460-message-api_postgres_data`, then `docker compose up -d`

---

### **Step 2: API Key Generation Page**
Create a simple HTML form at `/api-key`

**Endpoint:** `GET /api-key`
- Serves HTML form with name and email fields
- Clean, educational UI explaining API keys

**Endpoint:** `POST /api-key`
- Accepts name and email
- Generates unique API key (UUID v4)
- Stores in database
- Returns key to user with instructions

**User Experience:**
```
┌─────────────────────────────────────┐
│  Get Your API Key                   │
│                                     │
│  Name:    [John Doe        ]       │
│  Email:   [john@example.com]       │
│                                     │
│         [Generate Key]              │
└─────────────────────────────────────┘

After submission:
┌─────────────────────────────────────┐
│  ✅ API Key Generated!              │
│                                     │
│  Your API Key:                      │
│  abc123def456...                    │
│                                     │
│  Usage:                             │
│  curl -H "X-API-Key: abc123..."     │
│      http://localhost:4000/...      │
└─────────────────────────────────────┘
```

---

### **Step 3: Authentication Middleware**
Create middleware to validate API keys

**File:** `src/core/middleware/apiKeyAuth.ts`

```typescript
// Check X-API-Key header
// Query database for valid key
// If valid: attach key info to request, continue
// If invalid: return 401 Unauthorized

Features:
- Update last_used_at timestamp
- Increment request_count (educational metric)
- Attach key metadata to request object
```

**Header Format:**
```
X-API-Key: abc123def456789...
```

---

### **Step 4: Protected Message Routes**
Duplicate message routes under `/protected`

**New Routes Structure:**
```
/message/*              → Public routes (existing)
/protected/message/*    → Protected routes (new, require API key)
```

**File:** `src/routes/closed/messageRoutes.ts` (new file)
- Import same controllers from messageController
- Apply apiKeyAuth middleware
- Same endpoints, different path

**Endpoints:**
```
POST   /protected/message
GET    /protected/message?priority={1|2|3}
PATCH  /protected/message
DELETE /protected/message?priority={1|2|3}
GET    /protected/message/all
GET    /protected/message/:name
DELETE /protected/message/:name
```

---

### **Step 5: Update Swagger Documentation**
Add security scheme and protected endpoints

```yaml
components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
      description: API key for accessing protected endpoints

paths:
  /api-key:
    get: # Show generation form
    post: # Generate new key

  /protected/message:
    post:
      security:
        - ApiKeyAuth: []
    # ... etc
```

---

## Educational Benefits

### **Learning Objectives:**
1. ✅ **Authentication vs Authorization** - Understand the difference
2. ✅ **API Key Lifecycle** - Generation → Usage → Revocation
3. ✅ **Middleware Patterns** - Request interception and validation
4. ✅ **Security Headers** - Custom header authentication
5. ✅ **Database-backed Auth** - Persistent authentication storage
6. ✅ **Rate Limiting Basics** - Track request counts (foundation for rate limiting)
7. ✅ **Public vs Protected APIs** - Same functionality, different access control

### **Comparisons to Teach:**
- **API Keys vs JWT** - Simpler but less secure, no expiration
- **Header-based vs Cookie-based** - Different authentication approaches
- **Stateful (DB lookup) vs Stateless (JWT)** - Trade-offs

---

## File Structure

```
src/
├── routes/
│   ├── open/
│   │   └── messageRoutes.ts         # Existing public routes
│   ├── closed/
│   │   ├── index.ts                 # Update to include protected messages
│   │   ├── messageRoutes.ts         # NEW: Protected message routes
│   │   └── apiKeyRoutes.ts          # NEW: API key generation routes
│   └── index.ts                     # Update to mount /api-key
├── core/
│   ├── middleware/
│   │   ├── apiKeyAuth.ts            # NEW: API key validation middleware
│   │   └── validation.ts            # Existing
│   └── utilities/
│       └── apiKeyUtils.ts           # NEW: Key generation helpers
├── controllers/
│   └── apiKeyController.ts          # NEW: Key generation logic
├── types/
│   └── apiKeyTypes.ts               # NEW: API key type definitions
└── data/
    └── init.sql                     # ✅ UPDATED: Added api_keys table

docs-2.0/
└── authentication-guide.md          # NEW: Educational comparison of API Keys vs JWT
```

---

## Implementation Steps

### **Phase 1: Database & Types** ✅ COMPLETED
1. ✅ Update `data/init.sql` to include `api_keys` table (COMPLETED)
2. ✅ Define TypeScript types (`ApiKeyRecord`, `ApiKeyRequest`, `ApiKeyInfo`, `ApiKeyResponse`, `AuthenticatedRequest`) - Created `src/types/apiKeyTypes.ts`
3. ✅ Export types from `src/types/index.ts` barrel export
4. ✅ Database rebuilt with new schema - Verified `api_keys` table with all indexes

**Note:** The `api_keys` table has been added to `data/init.sql`. Docker volume location: `/var/lib/docker/volumes/tcss-460-message-api_postgres_data/_data` (on macOS, this is inside Docker Desktop's VM). To apply:
```bash
# Stop the database
docker compose down

# Remove the volume to delete old data
docker volume rm tcss-460-message-api_postgres_data

# Rebuild and start fresh
docker compose up -d
```

### **Phase 2: Key Generation** ✅ COMPLETED
1. ✅ Create `apiKeyUtils.ts` with UUID generation
   - `generateApiKey()` - Generates secure UUID v4 keys
   - `isValidApiKeyFormat()` - Validates UUID format
   - Comprehensive JSDoc documentation
   - ✅ Jest unit tests (21 tests passing)
2. ✅ Create `apiKeyController.ts` with generation logic
   - `generateApiKeyController` - Generates and stores keys in database
   - `serveApiKeyForm` - Serves HTML form from `src/views/api-key-form.html`
3. ✅ Create `apiKeyValidation.ts` validation middleware
   - `validateGenerateApiKey` - Validates name (required) and email (optional)
4. ✅ Create `apiKeyRoutes.ts` with GET/POST endpoints
   - `GET /api-key` - Serve HTML form
   - `POST /api-key` - Generate new key (with validation)
5. ✅ Create HTML form page for key generation
   - Beautiful, responsive form in `src/views/api-key-form.html`
   - Client-side JavaScript for form submission
6. ✅ Test key generation in database
   - Successfully tested: API key stored in database
   - TypeScript passes, no lint errors in Phase 2 code

### **Phase 3: Authentication Middleware** ✅ COMPLETED
1. ✅ Create `apiKeyAuth.ts` middleware
   - Validates `X-API-Key` header
   - Format validation using `isValidApiKeyFormat()`
   - Database lookup for key verification
   - Active status check (`is_active` flag)
2. ✅ Implement database lookup and validation
   - Query `api_keys` table for key verification
   - Validate key exists and is active
   - Return appropriate error codes (AUTH_KEY_REQUIRED, AUTH_KEY_INVALID, AUTH_KEY_REVOKED)
3. ✅ Add request tracking (last_used_at, request_count)
   - Update `last_used_at` timestamp on each authenticated request
   - Increment `request_count` for usage analytics
   - Educational: Foundation for rate limiting
4. ✅ Create protected message routes
   - Created `src/routes/closed/messageRoutes.ts`
   - All message endpoints duplicated under `/protected/message/*`
   - API key authentication required for all routes
5. ✅ Add authentication error codes
   - `AUTH_KEY_REQUIRED` - Missing API key
   - `AUTH_KEY_INVALID` - Invalid or non-existent key
   - `AUTH_KEY_REVOKED` - Inactive key
6. ✅ Test middleware with valid/invalid keys
   - ✅ No API key → 401 AUTH_KEY_REQUIRED
   - ✅ Invalid format → 401 AUTH_KEY_INVALID
   - ✅ Valid API key → 200 Success
   - ✅ Request tracking verified (count incremented, timestamp updated)

### **Phase 4: Protected Routes** ✅ COMPLETED (integrated with Phase 3)
1. ✅ Create `closed/messageRoutes.ts` (duplicate with middleware)
   - All message CRUD endpoints duplicated
   - `apiKeyAuth` middleware applied to all routes
2. ✅ Update `closed/index.ts` to mount protected routes
   - Mounted `/message` under `/protected`
3. ✅ Routes already exposed properly
   - `/api-key` publicly accessible (Phase 2)
   - `/protected/message/*` requires authentication (Phase 3)
4. ✅ Test all protected endpoints
   - Authentication working on `/protected/message/all`
   - All endpoints require valid `X-API-Key` header

### **Phase 5: Swagger Documentation** ✅ COMPLETED
1. ✅ Update `swagger.yaml` with security schemes
   - Added `ApiKeyAuth` security scheme in components
   - Documented header-based authentication (X-API-Key)
   - Educational notes comparing stateful vs stateless auth
2. ✅ Document `/api-key` endpoints
   - `GET /api-key` - HTML form for key generation
   - `POST /api-key` - Key generation with validation
   - Complete request/response schemas
   - Educational notes about UUID generation and stateful auth
3. ✅ Document all protected endpoints
   - `POST /protected/message` - Create message (authenticated)
   - `GET /protected/message?priority=N` - Get by priority (authenticated)
   - `PATCH /protected/message` - Update message (authenticated)
   - `DELETE /protected/message?priority=N` - Delete by priority (authenticated)
   - `GET /protected/message/all` - Get all messages (authenticated)
   - `GET /protected/message/{name}` - Get by name (authenticated)
   - `DELETE /protected/message/{name}` - Delete by name (authenticated)
   - All endpoints include `security: - ApiKeyAuth: []`
4. ✅ Add examples with API key headers
   - 401 error examples (AUTH_KEY_REQUIRED, AUTH_KEY_INVALID)
   - curl examples showing X-API-Key header usage
   - Request/response examples for all protected endpoints
5. ✅ Update startup logs to show `/api-key` endpoint
   - Already completed in Phase 2: `🔑 Generate API Key: http://localhost:{PORT}/api-key`

### **Phase 6: Educational Documentation** ✅ COMPLETED

**File:** `docs-2.0/authentication-guide.md` ✅ Created

**Content Structure Implemented:**
1. ✅ **Introduction to API Authentication**
   - Why APIs need authentication (security, access control)
   - Authentication vs Authorization definitions
   - Common authentication methods overview (5 methods listed)

2. ✅ **API Keys Deep Dive**
   - What are API keys (UUID-based tokens)
   - How API keys work (complete implementation from this project)
   - API key lifecycle diagram (generation → usage → revocation)
   - Full implementation with code examples from project
   - Security considerations (advantages, risks, best practices)

3. ✅ **JWT (JSON Web Tokens) Deep Dive**
   - What are JWTs (self-contained signed tokens)
   - JWT structure breakdown (header, payload, signature with examples)
   - How JWTs work (conceptual code examples)
   - JWT lifecycle diagram (issuance → usage → expiration)
   - Reference to credentialing server for comparison
   - Security considerations (advantages, risks, best practices)

4. ✅ **Side-by-Side Comparison**
   - Feature comparison table (14 features compared)
   - Detailed pros/cons of each approach
   - Performance implications (DB query vs signature verification)
   - Scalability considerations (database vs stateless)
   - Security trade-offs analysis

5. ✅ **When to Use Which**
   - API Keys best for: Service-to-service, long-lived credentials, request tracking
   - JWTs best for: User authentication, distributed systems, stateless scaling
   - Real-world examples (Google Maps, Stripe, Auth0, Firebase, Okta)
   - Hybrid approaches explanation

6. ✅ **Implementation Examples**
   - Complete code examples from this project:
     - Database schema (api_keys table)
     - Key generation utility (apiKeyUtils.ts)
     - Authentication middleware (apiKeyAuth.ts)
     - Protected route configuration
     - Usage examples with curl commands
   - JWT conceptual examples for comparison
   - Request flow diagrams

7. ✅ **Hands-On Exercises**
   - Exercise 1: Generate and test API key
   - Exercise 2: Compare public vs protected endpoints
   - Exercise 3: API key revocation
   - Exercise 4: Request tracking and analytics
   - Exercise 5: Performance comparison (advanced)
   - Exercise 6: Cross-reference with JWT (conceptual)
   - All exercises include SQL queries, curl commands, and expected results

**Additional Features:**
- ✅ Quick Navigation section with links to related code
- ✅ Visual diagrams (authentication flows, lifecycles)
- ✅ Code syntax highlighting in examples
- ✅ Security best practices sections
- ✅ Summary and key takeaways
- ✅ Links to related documentation

**Integration:**
- ✅ Added to `docs-2.0/README.md` Advanced Topics section
- ✅ Added to Learning Objectives & Resources (new "API Security & Authentication" section)
- ✅ Cross-referenced in web-security-guide.md
- ✅ Documented in Swagger (security schemes, protected endpoints)

**Learning Objectives Achieved:**
- ✅ Understand fundamental differences between stateful and stateless auth
- ✅ Learn when to choose API keys vs JWTs (decision matrix provided)
- ✅ Grasp security implications of each approach (detailed analysis)
- ✅ Connect theory to practical implementation (complete working examples)

---

## Response Examples

### **401 Unauthorized (Missing Key):**
```json
{
  "success": false,
  "message": "API key required - visit /api-key to generate one",
  "code": "AUTH_KEY_REQUIRED",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **401 Unauthorized (Invalid Key):**
```json
{
  "success": false,
  "message": "Invalid API key - please check your key or generate a new one at /api-key",
  "code": "AUTH_KEY_INVALID",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### **200 Success (Valid Key):**
```json
{
  "success": true,
  "data": {
    "entry": "{1} - [John Doe] says: Protected message!",
    "messageId": 123
  },
  "message": "Message created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Testing Strategy

### **Manual Testing:**
```bash
# 1. Generate API key
curl http://localhost:4000/api-key  # Get form
curl -X POST http://localhost:4000/api-key \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com"}'

# 2. Test without key (should fail)
curl http://localhost:4000/protected/message/all

# 3. Test with valid key (should work)
curl http://localhost:4000/protected/message/all \
  -H "X-API-Key: abc123..."

# 4. Test with invalid key (should fail)
curl http://localhost:4000/protected/message/all \
  -H "X-API-Key: invalid"
```

---

## Bonus Educational Features (Optional)

### **1. Key Management Page**
- `GET /api-key/manage?key=abc123` - View key stats
- Show request_count, last_used_at
- Revoke key button

### **2. Simple Rate Limiting**
- Add `daily_request_limit` column
- Check request_count in middleware
- Reset counter daily

### **3. Key Expiration**
- Add `expires_at` column
- Check expiration in middleware
- Teach key rotation concepts

---

## Implementation Recommendation

**Start with the core implementation:**
1. Database table
2. Key generation page
3. Validation middleware
4. Protected routes
5. Swagger docs
6. **Educational guide** (authentication-guide.md)

**Then optionally add:**
- Key management/stats page
- Basic rate limiting demo
- Key expiration demo

This provides a **complete, simple, educational authentication system** that students can understand and experiment with!

---

## Educational Documentation Details

### **authentication-guide.md Structure**

The educational guide should include:

#### **1. Visual Diagrams**
- API Key flow: Client → Header → Middleware → Database → Controller
- JWT flow: Client → Token → Verify Signature → Decode Claims → Controller
- Comparison diagram showing stateful vs stateless

#### **2. Code Examples**
```typescript
// API Key Example (from this project)
curl -H "X-API-Key: abc123..." http://localhost:4000/protected/message/all

// JWT Example (conceptual - from credentialing server)
curl -H "Authorization: Bearer eyJhbGc..." http://auth-server:3000/api/users
```

#### **3. Comparison Table**
| Feature | API Keys | JWT |
|---------|----------|-----|
| **Storage** | Database | Self-contained token |
| **State** | Stateful (DB lookup) | Stateless (no DB needed) |
| **Revocation** | Easy (update DB) | Difficult (need blacklist) |
| **Expiration** | Optional | Built-in (exp claim) |
| **Use Case** | Service APIs | User sessions |
| **Scalability** | DB dependency | Highly scalable |
| **Security** | Simple, clear | Complex, cryptographic |
| **Performance** | DB query per request | No DB query |

#### **4. Real-World Examples**
- **API Keys:** Google Maps API, Stripe, SendGrid, GitHub PATs
- **JWT:** Auth0, Firebase Auth, Okta, OAuth 2.0

#### **5. Security Considerations**
- API Key rotation policies
- HTTPS requirement for both
- Rate limiting importance
- Storage security (environment variables vs secrets management)

#### **6. Hands-On Learning Path**
1. Read authentication concepts
2. Generate API key at `/api-key`
3. Test public vs protected endpoints
4. Compare with JWT system (credentialing server)
5. Experiment with key revocation
6. Observe request metrics

This guide will be accessible through `/doc/authentication-guide.md` and linked from:
- API key generation page
- Swagger documentation
- Main documentation index (README.md)
