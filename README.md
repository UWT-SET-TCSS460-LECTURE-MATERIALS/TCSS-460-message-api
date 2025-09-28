# TCSS 460 Message API

RESTful API for managing message entries with name, message content, and priority levels. Built with Node.js, Express, TypeScript, and PostgreSQL following educational best practices for senior-level computer science coursework.

## Project Structure

```
tcss-460-message-api/
├── src/
│   ├── app.ts                      # Express app configuration
│   ├── index.ts                    # Server lifecycle management
│   ├── controllers/                # Business logic controllers
│   │   └── index.ts               # Controller barrel exports
│   ├── core/
│   │   ├── middleware/            # Request processing middleware
│   │   │   ├── index.ts          # Middleware barrel exports
│   │   │   └── validation.ts     # Request validation middleware
│   │   ├── models/               # TypeScript interfaces and types
│   │   │   └── index.ts         # Model definitions and exports
│   │   └── utilities/           # Reusable utility functions
│   │       ├── __tests__/      # Utility function tests
│   │       ├── index.ts        # Utility barrel exports
│   │       ├── database.ts     # Database connection management
│   │       ├── envConfig.ts    # Environment configuration
│   │       ├── errorCodes.ts   # Application error codes
│   │       ├── responseUtils.ts # HTTP response utilities
│   │       ├── validationUtils.ts # Input validation utilities
│   │       └── transactionUtils.ts # Database transaction utilities
│   ├── routes/                 # Express route definitions
│   │   ├── index.ts           # Main router
│   │   ├── open/              # Public routes (no auth required)
│   │   │   └── index.ts
│   │   └── closed/            # Protected routes (auth required)
│   │       └── index.ts
│   └── test/                  # Test configuration
│       └── setup.ts          # Jest test setup
├── data/                      # Database scripts and sample data
│   └── init.sql              # Database initialization
├── docs/                      # API documentation
├── coverage/                  # Test coverage reports (generated)
├── docker-compose.yml         # Local development database
├── jest.config.js            # Jest testing configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── README.md                 # Project documentation
```

## Development Philosophy

- **Readable and contextual identifiers** - Uses descriptive variable and function names
- **Functional expression-based coding** - Prefers functional approaches when readable
- **Educational clarity** - Focuses on teaching concepts over optimization
- **Simple database design** - Clean and understandable schema
- **Comprehensive error handling** - Consistent error responses and validation

## Quick Start

### Prerequisites

- Node.js (v18 or later)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the PostgreSQL database:
   ```bash
   npm run docker:up
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The API will be available at http://localhost:4000

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled JavaScript
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run typecheck` - Run TypeScript type checking
- `npm run docker:up` - Start PostgreSQL database
- `npm run docker:down` - Stop PostgreSQL database

## Database

The project uses PostgreSQL running in Docker. The database schema includes:

- **messages table**: Stores message entries with name, message, priority, and timestamps
- **Constraints**: Priority must be 1-3, names must be unique
- **Indexes**: Optimized for common query patterns

### Database Configuration

- **Host**: localhost
- **Port**: 5433 (mapped from container's 5432)
- **Database**: message_db
- **User**: postgres
- **Password**: password

## Environment Configuration

Create `.env.development` file with:

```env
NODE_ENV=development
PORT=4000

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=message_db
```

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Core API (To be implemented)
- `POST /api/v1/message` - Create new message entry
- `GET /api/v1/message?priority={level}` - Get messages by priority
- `GET /api/v1/message/all` - Get all messages
- `GET /api/v1/message/{name}` - Get message by name
- `PATCH /api/v1/message` - Update existing message
- `DELETE /api/v1/message?priority={level}` - Delete messages by priority
- `DELETE /api/v1/message/{name}` - Delete message by name

## Development Features

- **TypeScript**: Full type safety with path mapping
- **Express**: Fast, minimalist web framework
- **PostgreSQL**: Robust relational database
- **Jest**: Comprehensive testing framework
- **Docker**: Consistent development environment
- **Hot Reload**: Automatic server restart during development
- **Error Handling**: Structured error responses
- **Validation**: Input validation with express-validator

## Testing

Run tests with:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Architecture Patterns

### Utilities Layer
- Database connection management
- Environment configuration
- Response formatting
- Validation helpers
- Transaction management

### Middleware Layer
- Request validation
- Error handling
- Authentication (to be implemented)

### Controller Layer
- Business logic
- Request/response handling
- Database operations

### Route Organization
- Open routes: Public endpoints
- Closed routes: Protected endpoints (when auth is added)

## Educational Objectives

This project demonstrates:
- RESTful API design principles
- HTTP request/response patterns
- Database integration and transactions
- TypeScript in Node.js applications
- Testing strategies and test-driven development
- Clean code architecture and separation of concerns
- Environment-based configuration
- Docker containerization

## Next Steps

1. Implement message controller methods
2. Add API route handlers
3. Create comprehensive test suite
4. Add API documentation with Swagger
5. Implement authentication middleware
6. Add input validation for message endpoints

---

Built for TCSS 460 - Software Engineering at University of Washington Tacoma