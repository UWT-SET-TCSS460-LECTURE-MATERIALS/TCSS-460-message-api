# TCSS 460 Message API

> **University of Washington Tacoma**
>
> **School of Engineering and Technology**
>
> **Computer Science and Systems**
>
> **TCSS 460 A - Client/Server Programming for Internet Applications**
>
> **Autumn 2025**
>
> **Instructor:** Professor Charles Bryan
>
> **Email:** cfb3@uw.edu

A production-ready RESTful API for managing message entries with priority levels and API key authentication. Built with Node.js, Express, TypeScript, and PostgreSQL following professional best practices and educational clarity for senior-level computer science coursework.

## 🚀 Features

- **Complete CRUD Operations** - Create, read, update, and delete messages
- **Priority Management** - Three-level priority system (1=high, 2=medium, 3=low)
- **API Key Authentication** - Secure protected endpoints with API key validation
- **Consistent Response Structure** - Standardized `MessageEntry` format across all endpoints
- **Comprehensive Documentation** - Swagger/OpenAPI spec and educational guides
- **Full Test Coverage** - 68 automated Postman/Newman test assertions
- **Type Safety** - Full TypeScript implementation with strict typing
- **Input Validation** - Express-validator middleware for request validation
- **Error Handling** - Standardized error codes and descriptive messages
- **Docker Integration** - Containerized PostgreSQL database

## 📚 Quick Links

- **API Documentation (Swagger UI):** http://localhost:8000/api-docs
- **Educational Documentation:** http://localhost:8000/doc
- **Generate API Key:** http://localhost:8000/api-key
- **Health Check:** http://localhost:8000/health

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Development](#development)
- [Educational Objectives](#educational-objectives)

## 🏁 Quick Start

### Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd TCSS-460-message-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create `.env.development` file:
   ```env
   NODE_ENV=development
   PORT=8000

   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5433
   DB_USER=postgres
   DB_PASSWORD=password
   DB_NAME=message_db
   ```

4. **Start the PostgreSQL database**
   ```bash
   npm run docker:up
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or with nodemon for hot reload:
   npm run local
   ```

6. **Access the API**
   - API: http://localhost:8000
   - Swagger UI: http://localhost:8000/api-docs
   - Documentation: http://localhost:8000/doc

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run local        # Start with nodemon (hot reload)
npm run build        # Compile TypeScript to JavaScript
npm start            # Run compiled production build

# Database
npm run docker:up    # Start PostgreSQL container
npm run docker:down  # Stop and remove PostgreSQL container

# Testing
npm test             # Run Jest unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Quality Checks
npm run typecheck           # Run TypeScript type checking
npm run typecheck:watch     # Type check in watch mode
npm run lint                # Run ESLint
```

## 🔌 API Endpoints

### Public Endpoints (No Authentication Required)

#### Health & Setup
- `GET /health` - Server health status
- `GET /api-key` - API key generation form (HTML)
- `POST /api-key` - Generate new API key

#### Messages - CRUD Operations
- `POST /message` - Create new message
- `GET /message?priority={1-3}` - Get messages by priority level
- `GET /message/all` - Get all messages with statistics
- `GET /message/{name}` - Get specific message by sender name
- `PATCH /message` - Update existing message content
- `DELETE /message?priority={1-3}` - Delete all messages with priority
- `DELETE /message/{name}` - Delete specific message by name

### Protected Endpoints (API Key Required)

All protected endpoints require the `x-api-key` header:

```bash
curl -H "x-api-key: your-api-key-here" http://localhost:8000/protected/message/all
```

#### Protected Messages - Same operations as public
- `POST /protected/message`
- `GET /protected/message?priority={1-3}`
- `GET /protected/message/all`
- `GET /protected/message/{name}`
- `PATCH /protected/message`
- `DELETE /protected/message?priority={1-3}`
- `DELETE /protected/message/{name}`

### Response Format

All endpoints return consistent JSON responses:

#### Success Response
```json
{
  "success": true,
  "message": "Operation description",
  "data": {
    "name": "John Doe",
    "message": "Hello World",
    "priority": 1,
    "formatted": "{1} - [John Doe] says: Hello World"
  },
  "timestamp": "2025-10-11T10:30:00.000Z"
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "MSG_NAME_EXISTS",
  "timestamp": "2025-10-11T10:30:00.000Z"
}
```

### Example Requests

#### Create a Message
```bash
curl -X POST http://localhost:8000/message \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "message": "Hello World",
    "priority": 1
  }'
```

#### Get Messages by Priority
```bash
curl http://localhost:8000/message?priority=1
```

#### Update a Message
```bash
curl -X PATCH http://localhost:8000/message \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "message": "Updated message content"
  }'
```

#### Delete a Message
```bash
curl -X DELETE http://localhost:8000/message/John%20Doe
```

## 🔐 Authentication

### Generating an API Key

1. **Using the Web Form:**
   - Visit http://localhost:8000/api-key
   - Enter your name and email
   - Copy the generated API key

2. **Using cURL:**
   ```bash
   curl -X POST http://localhost:8000/api-key \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john@example.com"
     }'
   ```

### Using Protected Endpoints

Add the `x-api-key` header to your requests:

```bash
curl -H "x-api-key: your-api-key-here" \
  http://localhost:8000/protected/message/all
```

API keys are:
- 48 characters long
- Securely hashed in the database
- Tracked for usage statistics
- Can be activated/deactivated

## 📁 Project Structure

```
tcss-460-message-api/
├── src/
│   ├── index.ts                    # Server entry point with lifecycle management
│   ├── app.ts                      # Express app configuration
│   ├── types/                      # TypeScript type definitions
│   │   ├── messageTypes.ts        # Message-related types
│   │   ├── apiKeyTypes.ts         # API key types
│   │   ├── apiTypes.ts            # API response types
│   │   └── errorTypes.ts          # Error code definitions
│   ├── controllers/                # Business logic
│   │   ├── messageController.ts   # Message CRUD operations
│   │   ├── apiKeyController.ts    # API key generation
│   │   └── documentationController.ts # Documentation routes
│   ├── routes/                     # Express routes
│   │   ├── index.ts               # Main router
│   │   ├── open/                  # Public routes
│   │   └── closed/                # Protected routes
│   ├── core/
│   │   ├── middleware/            # Express middleware
│   │   │   ├── messageValidation.ts  # Message validation rules
│   │   │   ├── apiKeyValidation.ts   # API key validation rules
│   │   │   └── apiKeyAuth.ts         # Authentication middleware
│   │   └── utilities/             # Helper functions
│   │       ├── database.ts        # PostgreSQL connection pool
│   │       ├── envConfig.ts       # Environment configuration
│   │       ├── responseUtils.ts   # Response formatting
│   │       ├── validationUtils.ts # Input validation
│   │       ├── apiKeyUtils.ts     # API key generation/hashing
│   │       └── markdownUtils.ts   # Markdown processing
│   └── test/                      # Test configuration
│       └── setup.ts               # Jest setup
├── data/
│   └── init.sql                   # Database schema initialization
├── docs/
│   └── swagger.yaml               # OpenAPI 3.0 specification
├── testing/
│   └── postman/                   # Postman collections
│       └── TCSS-460-Message-API-Complete.postman_collection.json
├── ai.prof/                       # AI-assisted development documentation
│   ├── instructions.md            # Development guidelines
│   └── database-mocking-strategies.md # Testing strategies
├── docker-compose.yml             # PostgreSQL container config
├── jest.config.js                 # Jest configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies and scripts
```

## 🗄️ Database Schema

### Messages Table
```sql
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    message TEXT NOT NULL,
    priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 3),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Constraints:**
- `name` must be unique (serves as natural key)
- `priority` must be 1, 2, or 3
- `message` cannot be empty

**Indexes:**
- Primary key on `id`
- Unique index on `name`
- Index on `priority` for filtering queries

### API Keys Table
```sql
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE,
    request_count INTEGER DEFAULT 0
);
```

**Features:**
- API keys are hashed using SHA-256 before storage
- Tracks usage statistics (request count, last used)
- Can be activated/deactivated
- Email is optional

## 🧪 Testing

### Postman Collection

The project includes a comprehensive Postman collection with 68 automated test assertions.

**Run with Newman:**
```bash
# Install Newman globally
npm install -g newman

# Run the collection
newman run testing/postman/TCSS-460-Message-API-Complete.postman_collection.json \
  --delay-request 200
```

**Test Coverage:**
- Health checks and API key generation
- All CRUD operations (public endpoints)
- Priority-based filtering
- Validation error handling
- Authentication tests
- Protected endpoint operations
- Documentation endpoint verification

**Results:** 68/68 assertions passing ✅

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Current test files:**
- `src/core/utilities/__tests__/validationUtils.test.ts`
- `src/core/utilities/__tests__/apiKeyUtils.test.ts`

**Testing Strategy Documentation:**
See `ai.prof/database-mocking-strategies.md` for comprehensive testing strategies including:
- pg-mem (in-memory PostgreSQL)
- Testcontainers (real PostgreSQL in Docker)
- Docker Compose test environments
- Fixture and factory patterns

## 🛠️ Development

### Environment Configuration

The API uses environment-specific configuration files:

- `.env.development` - Local development
- `.env.test` - Testing environment
- `.env.production` - Production deployment

**Required Environment Variables:**
```env
NODE_ENV=development
PORT=8000

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=message_db
```

### Database Management

**Start database:**
```bash
npm run docker:up
```

**Stop database:**
```bash
npm run docker:down
```

**Database connection:**
- Host: localhost
- Port: 5433 (mapped from container's 5432)
- Database: message_db
- User: postgres
- Password: password

**Reset database:**
```bash
npm run docker:down
npm run docker:up
# The init.sql script runs automatically
```

### TypeScript Path Mapping

The project uses TypeScript path aliases for clean imports:

```typescript
import { sendSuccess } from '@utilities/responseUtils';
import { MessageEntry } from '@/types';
import { getPool } from '@db';
```

**Configured paths:**
- `@/*` → `src/*`
- `@utilities/*` → `src/core/utilities/*`
- `@db` → `src/core/utilities/database`

### Code Style

**Conventions:**
- Descriptive variable names for educational clarity
- Functional expression-based coding when readable
- Comprehensive JSDoc comments for all functions
- Async/await for asynchronous operations
- Express middleware for cross-cutting concerns

**Example:**
```typescript
/**
 * Create a new message entry in the database
 * Input validation handled by validateCreateMessage middleware
 *
 * @param request - Express request with validated message data in body
 * @param response - Express response for sending results
 * @returns Promise<void>
 * @throws Will send 400 error if name already exists
 */
export const createMessage = async (
    request: Request,
    response: Response
): Promise<void> => {
    // Implementation...
};
```

## 📖 Educational Objectives

### What Students Learn

This project demonstrates professional software engineering practices:

**1. RESTful API Design**
- Resource-based URL structure
- HTTP method semantics (GET, POST, PATCH, DELETE)
- Proper status codes (200, 201, 400, 401, 404, 500)
- Consistent response formats

**2. TypeScript in Node.js**
- Interface design and type safety
- Path mapping and module resolution
- Strict typing benefits
- Type-driven development

**3. Database Integration**
- PostgreSQL connection pooling
- SQL query parameterization (injection prevention)
- Transaction management
- Schema design and constraints

**4. Authentication & Security**
- API key generation and hashing
- Authentication middleware patterns
- Protected vs. public routes
- Secure credential storage

**5. Input Validation**
- Express-validator middleware
- Request sanitization
- Error response formatting
- Validation chain patterns

**6. Testing Strategies**
- End-to-end testing with Postman/Newman
- Automated test assertions
- Test data management
- Database mocking strategies (documented)

**7. Docker & Containers**
- Docker Compose for local development
- Container networking
- Volume management
- Environment isolation

**8. Code Organization**
- Layered architecture (routes → controllers → utilities)
- Separation of concerns
- Barrel exports for clean imports
- Modular design patterns

**9. Documentation**
- OpenAPI/Swagger specification
- Interactive API documentation
- Educational guides and examples
- In-code JSDoc comments

**10. Professional Development Practices**
- Git workflow and meaningful commits
- Environment-based configuration
- Error handling patterns
- Code reusability

### Key Design Decisions

**Why PostgreSQL over MongoDB?**
- Teaches relational database concepts
- ACID compliance for data integrity
- Schema enforcement
- SQL query skills

**Why Express over other frameworks?**
- Industry standard for Node.js APIs
- Minimal abstraction shows underlying concepts
- Extensive middleware ecosystem
- Clear request/response flow

**Why TypeScript?**
- Catches errors at compile time
- Better IDE support and autocomplete
- Self-documenting code with types
- Industry trend for large applications

**Why name as natural key?**
- Demonstrates alternative to surrogate keys
- More intuitive for API consumers
- Teaches uniqueness constraints
- Security: no database ID exposure

## 🚀 Deployment

### Production Considerations

**Before deploying to production:**

1. **Environment Variables**
   - Use production database credentials
   - Set `NODE_ENV=production`
   - Configure proper PORT binding
   - Use secrets management (not `.env` files)

2. **Security Enhancements**
   - Enable CORS with proper origins
   - Add rate limiting
   - Implement request logging
   - Use HTTPS/TLS
   - Add security headers (helmet)

3. **Database**
   - Use managed PostgreSQL (RDS, Cloud SQL, etc.)
   - Enable SSL connections
   - Set up automated backups
   - Configure connection pooling limits

4. **Monitoring**
   - Add application performance monitoring (APM)
   - Set up error tracking (Sentry, etc.)
   - Configure health check monitoring
   - Log aggregation and analysis

5. **Build Process**
   ```bash
   npm run build
   NODE_ENV=production npm start
   ```

## 📚 Additional Resources

### Documentation Files

- **Swagger UI:** `/api-docs` - Interactive API documentation
- **Educational Docs:** `/doc` - HTML guide with code examples
- **Database Strategies:** `ai.prof/database-mocking-strategies.md`
- **Development Guidelines:** `ai.prof/instructions.md`

### Useful Commands

```bash
# Type check without running
npm run typecheck

# Build and check for errors
npm run build

# Clean build artifacts
rm -rf dist/

# View database logs
docker logs message-api-postgres

# Connect to database CLI
docker exec -it message-api-postgres psql -U postgres -d message_db
```

### API Testing with cURL

```bash
# Complete workflow example
# 1. Create message
curl -X POST http://localhost:8000/message \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","message":"Hello","priority":1}'

# 2. Get all messages
curl http://localhost:8000/message/all

# 3. Get by priority
curl http://localhost:8000/message?priority=1

# 4. Update message
curl -X PATCH http://localhost:8000/message \
  -H "Content-Type: application/json" \
  -d '{"name":"TestUser","message":"Updated"}'

# 5. Delete message
curl -X DELETE http://localhost:8000/message/TestUser
```

## 🤝 Contributing

This project is designed for educational purposes. When contributing:

1. Follow the existing code style
2. Add JSDoc comments for new functions
3. Update tests for new features
4. Keep educational clarity as a priority
5. Document design decisions

## 📄 License

This project is created for educational purposes at University of Washington Tacoma, TCSS 460 - Software Engineering.

## 👥 Authors

Built for TCSS 460 with focus on teaching professional software engineering practices through hands-on API development.

---

**Questions or Issues?**
- Check the Swagger documentation: http://localhost:8000/api-docs
- Review the educational guide: http://localhost:8000/doc
- Examine the comprehensive Postman collection
- See testing strategies in `ai.prof/database-mocking-strategies.md`
