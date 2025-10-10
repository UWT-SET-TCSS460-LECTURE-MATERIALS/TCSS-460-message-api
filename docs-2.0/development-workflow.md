# Development Workflow & Build Process

A comprehensive guide to understanding the TypeScript compilation process, development modes, and professional tooling workflows in Node.js/Express applications.

> **💡 Related Code**: See implementations in [`package.json`](../package.json), [`tsconfig.json`](../tsconfig.json), [`.eslintrc.js`](../.eslintrc.js), and [`/src/index.ts`](../src/index.ts)

## Quick Navigation
- 🏗️ **TypeScript Config**: [`tsconfig.json`](../tsconfig.json) - Compilation settings
- 📦 **Build Scripts**: [`package.json`](../package.json) - npm command definitions
- 🔍 **Linting Config**: [`.eslintrc.js`](../.eslintrc.js) - Code quality rules
- 🎨 **Format Config**: [`.prettierrc`](../.prettierrc) - Code formatting rules
- 🚀 **Server Entry**: [`index.ts`](../src/index.ts) - Application startup
- 🏗️ **Architecture**: [Node.js Architecture](./node-express-architecture.md#application-lifecycle) - Application structure
- ⚙️ **Environment**: [Environment Configuration](./environment-configuration.md) - Configuration management
- 📘 **TypeScript**: [TypeScript Patterns](./typescript-patterns.md) - Type system usage

## Table of Contents

- [Why This Matters](#why-this-matters)
- [TypeScript Compilation Fundamentals](#typescript-compilation-fundamentals)
- [Development Mode Explained](#development-mode-explained)
- [Type Checking Process](#type-checking-process)
- [Production Build Process](#production-build-process)
- [Running Production Builds](#running-production-builds)
- [Code Quality Tools](#code-quality-tools)
- [Complete Workflow Examples](#complete-workflow-examples)
- [Development vs Production Comparison](#development-vs-production-comparison)
- [Troubleshooting Guide](#troubleshooting-guide)

---

## Understanding npm and package.json

### What is npm?

**npm** stands for **Node Package Manager**. It's the tool that:

- 📦 **Installs libraries** your project needs (Express, TypeScript, etc.)
- 🔄 **Manages versions** to ensure compatibility
- 🎯 **Runs scripts** like `npm run dev` and `npm run build`
- 🌐 **Accesses registry** with millions of open-source packages

**Think of npm as:**
- **App Store for code** - Browse and install packages
- **Project manager** - Handles dependencies automatically
- **Task runner** - Executes commands defined in `package.json`

### What is package.json?

**package.json** is your project's **blueprint** or **recipe**. It defines:

```json
{
  "name": "tcss-460-message-api",
  "version": "1.0.0",
  "description": "Educational Express.js API",
  "scripts": {
    "dev": "ts-node-dev --respawn...",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "typescript": "^5.1.6",
    "@types/express": "^4.17.17"
  }
}
```

**Key sections explained:**

**1. Project Metadata**
```json
"name": "tcss-460-message-api",
"version": "1.0.0",
"description": "Educational Express.js API"
```
Identifies your project.

**2. Scripts (Your Commands)**
```json
"scripts": {
  "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "type-check": "tsc --noEmit",
  "lint": "eslint src/**/*.ts",
  "format": "prettier --write src/**/*.ts"
}
```

Each script is a command shortcut:
- `npm run dev` → Runs the "dev" script
- `npm run build` → Runs the "build" script
- `npm start` → Special case, runs "start" script (no "run" needed)

**3. Dependencies (Production)**
```json
"dependencies": {
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

Packages **required to run** the application:
- Installed in production
- Needed for `npm start` to work

**4. DevDependencies (Development Only)**
```json
"devDependencies": {
  "typescript": "^5.1.6",
  "@types/express": "^4.17.17",
  "ts-node-dev": "^2.0.0",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0"
}
```

Packages **only needed during development**:
- Not installed in production (`npm ci --only=production`)
- Used for building, testing, linting

### Version Numbers Explained

**Semantic Versioning (SemVer):**

```
^4.18.2
│ │  │  └─ Patch (bug fixes)
│ │  └──── Minor (new features, backward compatible)
│ └─────── Major (breaking changes)
└───────── Caret (^) = Compatible updates allowed
```

**Symbols:**
- `^4.18.2` - Allow updates to 4.x.x (not 5.0.0)
- `~4.18.2` - Allow updates to 4.18.x only
- `4.18.2` - Exact version only

### What is node_modules/?

**The `node_modules/` folder** contains all installed packages:

```
node_modules/
├── express/              # Express.js code
├── cors/                 # CORS middleware code
├── typescript/           # TypeScript compiler
└── ... (hundreds more)   # All dependencies
```

**Key facts:**
- ⚠️ **Very large** - Can be 100,000+ files, 100+ MB
- ⚠️ **Don't commit to Git** - In `.gitignore`
- ✅ **Regenerate anytime** - Run `npm install`
- 🔗 **Includes sub-dependencies** - Packages that your packages need

### npm Commands You'll Use

**Installation:**
```bash
# Install all dependencies from package.json
npm install

# Install specific package (saves to dependencies)
npm install express

# Install as dev dependency (saves to devDependencies)
npm install --save-dev typescript

# Clean install (deletes node_modules first)
npm ci

# Production-only install (faster, smaller)
npm ci --only=production
```

**Running Scripts:**
```bash
# Run custom scripts (defined in package.json)
npm run dev
npm run build
npm run type-check
npm run lint

# Special scripts (don't need "run")
npm start
npm test
```

**Information:**
```bash
# List installed packages
npm list

# Show outdated packages
npm outdated

# Show package info
npm info express
```

**Updates:**
```bash
# Update all packages (within version constraints)
npm update

# Update specific package
npm update express
```

### How npm install Works

**When you run `npm install`:**

```
1. Read package.json
   ↓
2. Check package-lock.json (exact versions)
   ↓
3. Download packages from npm registry
   ↓
4. Install to node_modules/
   ↓
5. Install sub-dependencies
   ↓
6. Create/update package-lock.json
```

**First time (no package-lock.json):**
- Resolves versions based on `package.json`
- Creates `package-lock.json` with exact versions
- Takes longer

**Subsequent times (with package-lock.json):**
- Uses exact versions from lock file
- Faster and more consistent
- Ensures everyone has same versions

### package-lock.json

**What it does:**
- **Locks exact versions** of all packages
- **Ensures consistency** across team/environments
- **Speeds up installs** (no version resolution)

```json
{
  "name": "tcss-460-message-api",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/express": {
      "version": "4.18.2",
      "resolved": "https://registry.npmjs.org/express/-/express-4.18.2.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

**⚠️ Commit package-lock.json to Git!**

### Common npm Issues

**Issue: "Cannot find module 'express'"**
```bash
# Solution: Install dependencies
npm install
```

**Issue: Different versions on teammate's machine**
```bash
# Solution: Use package-lock.json
npm ci  # Uses locked versions
```

**Issue: npm install fails**
```bash
# Solution: Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue: Package version conflicts**
```bash
# Solution: Check for compatible versions
npm outdated
npm update
```

---

## Why This Matters

### The Learning Gap

Many students jump into writing TypeScript code without understanding what happens between writing code and running it. This creates confusion when:

- Changes don't appear when expected
- TypeScript errors are missed in development
- Production builds fail unexpectedly
- Different team members use different commands

Understanding the development workflow is fundamental to being an effective developer.

### What You'll Learn

After reading this guide, you'll understand:

✅ **What compilation is** and why TypeScript needs it
✅ **When to use** `npm run dev` vs `npm run build`
✅ **How hot-reload works** and when it doesn't
✅ **Type checking vs code generation** differences
✅ **Linting and formatting** for code quality
✅ **Production deployment** best practices

---

## TypeScript Compilation Fundamentals

### The Core Problem

**JavaScript engines (Node.js, browsers) cannot run TypeScript directly.**

TypeScript files (`.ts`) must be transformed into JavaScript files (`.js`) before Node.js can execute them.

### The Compilation Pipeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                     TYPESCRIPT COMPILATION                          │
└─────────────────────────────────────────────────────────────────────┘

Source Code (TypeScript)  →  Type Checking  →  Code Generation  →  JavaScript Output
     /src/*.ts                    ✓/✗              Transform           /dist/*.js
                                                                            ↓
                                                                      Node.js Execution
                                                                      node dist/index.js
```

### What is Compilation?

**Compilation** (or **transpilation** in TypeScript's case) is the process of:

1. **Reading** TypeScript source files
2. **Parsing** the TypeScript syntax
3. **Type Checking** for correctness (optional)
4. **Transforming** TypeScript features to JavaScript equivalents
5. **Generating** JavaScript output files

### The TypeScript Compiler (tsc)

The TypeScript compiler is invoked with the `tsc` command:

```bash
# Compile entire project using tsconfig.json
tsc

# Compile specific file
tsc src/index.ts

# Compile without emitting files (type check only)
tsc --noEmit

# Watch mode - recompile on changes
tsc --watch
```

**In our project:**
```json
// package.json
{
  "scripts": {
    "build": "tsc",                    // Full compilation
    "build:watch": "tsc --watch",      // Watch mode
    "type-check": "tsc --noEmit"       // Type check only
  }
}
```

### Why TypeScript?

**Type safety at compile time:**
```typescript
// TypeScript catches this error BEFORE running
interface MessageRequest {
  name: string;
  message: string;
  priority: number;
}

const request: MessageRequest = {
  name: "John",
  message: "Hello",
  priority: "high"  // ❌ TypeScript Error: Type 'string' is not assignable to type 'number'
};

// JavaScript would let this fail at runtime!
```

---

## Development Mode Explained

### Command: `npm run dev`

**What it does:**
```bash
ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/index.ts
```

Let's break down each part:

#### **ts-node-dev**

A tool that runs TypeScript directly in Node.js without pre-compilation.

- Combines `ts-node` (TypeScript execution) + `nodemon` (auto-restart)
- Compiles TypeScript **in memory** (no `dist/` folder)
- Optimized for development speed

#### **--respawn**

Automatically restarts the server when files change (hot-reload).

```
Edit src/app.ts → ts-node-dev detects change → Recompile → Restart server
       ↑                                                          ↓
       └──────────────── Continue developing ────────────────────┘
```

#### **--transpile-only**

**Skips type checking** during execution for faster compilation.

- **Faster:** No type checking means faster restarts
- **Trade-off:** Type errors won't be caught immediately
- **Solution:** Run `npm run type-check` separately

```typescript
// This will run with --transpile-only even though it has type errors
const age: number = "25";  // ❌ Type error, but dev server still runs

// To catch it:
// npm run type-check
```

#### **-r tsconfig-paths/register**

Registers TypeScript path aliases for clean imports.

```typescript
// Instead of messy relative imports:
import { sendSuccess } from '../../../core/utilities/responseUtils';

// Use clean path aliases:
import { sendSuccess } from '@utilities/responseUtils';
```

### The Development Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                     DEVELOPMENT MODE (npm run dev)                  │
└─────────────────────────────────────────────────────────────────────┘

   Start Server          Watch Files          Detect Change         Recompile
   npm run dev    →    ts-node-dev runs  →   File modified   →   In-memory
        ↓                     ↓                     ↓               ↓
   Load app.ts          Monitor /src          src/app.ts          Transpile
        ↓                     ↓                   changed            ↓
   Execute code      ← ← ← ← Restart ← ← ← ← ← ← ← ← ← ← ←   Execute new code
        ↓
   Server running
   Ready for requests
```

### What Happens in Memory

**No files are written** during development mode:

```
Before npm run dev:
/project
├── src/
│   ├── index.ts          ← Source files
│   ├── app.ts
│   └── controllers/
├── dist/                 ← Does not exist yet
└── node_modules/

During npm run dev:
/project
├── src/                  ← TypeScript source
│   ├── index.ts
│   └── app.ts
├── [MEMORY]              ← Compiled JavaScript in RAM
│   ├── index.js          ← Never written to disk
│   └── app.js            ← Only in memory
└── node_modules/
```

### When to Use Development Mode

✅ **Use `npm run dev` when:**
- Actively writing and testing code
- Need fast feedback on changes
- Experimenting with new features
- Learning and exploring the codebase
- Don't need production-level optimization

❌ **Don't use `npm run dev` when:**
- Deploying to production servers
- Testing production builds
- Running performance benchmarks
- Creating deployment artifacts

---

## Type Checking Process

### Command: `npm run type-check`

**What it does:**
```bash
tsc --noEmit
```

**Pure type checking** without generating JavaScript files.

### Why Type Check Separately?

Development mode (`--transpile-only`) skips type checking for speed. Type checking separately gives you:

✅ **Complete type safety** without slowing down development
✅ **All type errors at once** instead of one at a time
✅ **Fast validation** before committing code
✅ **CI/CD integration** for automated checking

### Type Checking Process

```
┌─────────────────────────────────────────────────────────────────────┐
│                  TYPE CHECKING PROCESS (tsc --noEmit)               │
└─────────────────────────────────────────────────────────────────────┘

Read tsconfig.json  →  Find all .ts files  →  Parse & analyze  →  Report errors
      ↓                       ↓                      ↓                   ↓
  Strict mode?        src/**/*.ts files      Type inference        ✓ No errors
  Path aliases?       Included files         Type checking         ✗ List errors
  Target version?     Excluded files         Interface matching
                                             Generic resolution
```

### Common Type Errors and Fixes

#### **1. Implicit Any**
```typescript
// ❌ Error: Parameter 'name' implicitly has an 'any' type
function greet(name) {
  return `Hello, ${name}`;
}

// ✅ Fix: Add type annotation
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

#### **2. Null/Undefined Issues**
```typescript
// ❌ Error: Object is possibly 'undefined'
const user = users.find(u => u.id === 1);
console.log(user.name);  // user might be undefined!

// ✅ Fix: Handle undefined case
const user = users.find(u => u.id === 1);
if (user) {
  console.log(user.name);
}

// Or use optional chaining
console.log(user?.name);
```

#### **3. Type Mismatch**
```typescript
// ❌ Error: Type 'string' is not assignable to type 'number'
interface Message {
  priority: number;
}

const msg: Message = {
  priority: "high"  // Wrong type!
};

// ✅ Fix: Use correct type
const msg: Message = {
  priority: 1  // Correct
};
```

#### **4. Missing Properties**
```typescript
// ❌ Error: Property 'message' is missing in type
interface MessageRequest {
  name: string;
  message: string;
  priority: number;
}

const request: MessageRequest = {
  name: "John",
  priority: 1
  // Missing 'message' property
};

// ✅ Fix: Include all required properties
const request: MessageRequest = {
  name: "John",
  message: "Hello",
  priority: 1
};
```

### Type Checking in Your Workflow

**Before committing code:**
```bash
npm run type-check
```

**If errors found:**
```bash
npm run type-check | grep error  # Show only errors

# Fix errors in source code
# Re-run type check
npm run type-check
```

**Continuous type checking (watch mode):**
```bash
npm run build:watch
# Runs tsc --watch - recheck types on every save
```

---

## Production Build Process

### Command: `npm run build`

**What it does:**
```bash
tsc
```

Compiles TypeScript to JavaScript using `tsconfig.json` configuration.

### Build Process Step-by-Step

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRODUCTION BUILD PROCESS (tsc)                   │
└─────────────────────────────────────────────────────────────────────┘

Step 1: Read Configuration
├── Load tsconfig.json
├── Determine target (ES2022)
├── Set output directory (dist/)
└── Configure options (strict, sourceMap, etc.)
        ↓
Step 2: Discover Files
├── Scan rootDir (src/)
├── Follow imports and dependencies
└── Apply include/exclude patterns
        ↓
Step 3: Parse TypeScript
├── Convert .ts files to AST (Abstract Syntax Tree)
├── Resolve type imports
└── Parse decorators and metadata
        ↓
Step 4: Type Check
├── Validate all type annotations
├── Check interface implementations
├── Verify generic constraints
└── Ensure type safety
        ↓
Step 5: Transform Code
├── Remove type annotations
├── Transform TypeScript features → JavaScript equivalents
├── Apply path alias resolutions
└── Optimize for target environment
        ↓
Step 6: Generate Output
├── Write JavaScript files to dist/
├── Generate source maps (*.map)
├── Generate type declarations (*.d.ts)
└── Remove comments (if configured)
        ↓
Step 7: Report Results
├── Show compilation statistics
├── Report any errors
└── Confirm successful build
```

### File Transformation Example

**Before Build (src/):**
```typescript
// src/controllers/healthController.ts
import { Request, Response } from 'express';
import { sendSuccess } from '@utilities/responseUtils';
import { HealthResponse } from '@/types';

export const getHealth = async (request: Request, response: Response): Promise<void> => {
  const healthData: HealthResponse = {
    status: 'OK',
    timestamp: new Date().toISOString()
  };

  sendSuccess(response, healthData, 'API is healthy');
};
```

**After Build (dist/):**
```javascript
// dist/controllers/healthController.js
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHealth = void 0;
const responseUtils_1 = require("../core/utilities/responseUtils");

const getHealth = async (request, response) => {
    const healthData = {
        status: 'OK',
        timestamp: new Date().toISOString()
    };
    (0, responseUtils_1.sendSuccess)(response, healthData, 'API is healthy');
};
exports.getHealth = getHealth;
//# sourceMappingURL=healthController.js.map
```

**Changes made by TypeScript compiler:**
1. Type annotations removed (`Request`, `Response`, `HealthResponse`, `Promise<void>`)
2. Path aliases resolved (`@utilities/` → `../core/utilities/`)
3. ES6 imports converted to CommonJS (`require`)
4. Added source map comment
5. Made compatible with Node.js runtime

### Build Output Structure

```
After npm run build:

dist/                           # Compiled JavaScript output
├── index.js                   # Entry point (from src/index.ts)
├── index.js.map              # Source map for debugging
├── index.d.ts                # Type declarations for consumers
├── app.js
├── app.js.map
├── app.d.ts
├── types/
│   ├── apiTypes.js
│   ├── apiTypes.d.ts         # Preserves type info
│   ├── errorTypes.js
│   └── errorTypes.d.ts
├── core/
│   ├── middleware/
│   │   ├── cors.js
│   │   ├── errorHandler.js
│   │   ├── logger.js
│   │   └── validation.js
│   └── utilities/
│       ├── envConfig.js
│       ├── responseUtils.js
│       └── validationUtils.js
└── controllers/
    ├── index.js
    └── messageController.js
```

### Source Maps Explained

**Source map files (*.map)** allow debugging compiled JavaScript as if it were TypeScript.

```
Runtime Error in:           Source Map Maps Back To:
dist/app.js:42             src/app.ts:28

Error: undefined variable   Your actual TypeScript code!
  at dist/app.js:42        Debugger shows: src/app.ts:28
```

**How it works:**
```json
// healthController.js.map
{
  "version": 3,
  "sources": ["../src/controllers/healthController.ts"],
  "mappings": ";;;AAAA,MAAM,EAAE,GAAG,EAAE...",
  "sourcesContent": ["import { Request, Response } from 'express'..."]
}
```

### Build Artifacts

After `npm run build`, you have **three sets of outputs**:

1. **JavaScript files (*.js)** - Executable code for Node.js
2. **Source maps (*.map)** - Debugging information
3. **Type declarations (*.d.ts)** - Type information for other TypeScript projects

### When to Build

✅ **Run `npm run build` when:**
- Preparing for production deployment
- Testing the production build locally
- Creating deployment artifacts
- Verifying build succeeds before merging code
- Running automated tests against compiled code

❌ **Don't run `npm run build` when:**
- Actively developing (use `npm run dev`)
- Only checking types (use `npm run type-check`)
- Just starting work (unnecessary)

---

## Database Development Workflow

When working with database operations:

1. **Design Schema First**: Plan your tables, relationships, and constraints
2. **Use Migrations**: Track database schema changes
3. **Test with Transactions**: Ensure data integrity
4. **Monitor Connection Pool**: Prevent connection leaks

**📚 Learn More:** [Database Fundamentals](/docs/database-fundamentals.md) - Comprehensive guide to database concepts and best practices

---

## Running Production Builds

### Command: `npm start`

**What it does:**
```bash
node dist/index.js
```

Runs the **compiled JavaScript** directly using Node.js.

### Prerequisites

**You must run `npm run build` first!**

```bash
# ❌ This will fail if dist/ doesn't exist
npm start

# ✅ Correct sequence
npm run build    # Compile TypeScript → JavaScript
npm start        # Run compiled JavaScript
```

### Production vs Development Execution

**Development Mode:**
```bash
npm run dev

ts-node-dev → Compile TS in memory → Execute JS in memory → Run server
              (Slow startup)          (Auto-restart)        (Dev features)
```

**Production Mode:**
```bash
npm run build → npm start

tsc → Generate dist/ → node dist/index.js → Run server
      (One-time)        (Fast startup)      (Optimized)
```

### Production Characteristics

When running `npm start`:

✅ **Fast startup** - No compilation overhead
✅ **Optimized execution** - Production JavaScript
✅ **No auto-restart** - Must manually restart on changes
✅ **Minimal logging** - Only essential output
✅ **Production environment** - Uses production config

❌ **No hot-reload** - Changes require rebuild
❌ **No TypeScript errors** - Already compiled
❌ **No type information** - Runtime only

### Production Deployment Workflow

**Complete deployment sequence:**

```bash
# Step 1: Install production dependencies only
npm ci --only=production

# Step 2: Build TypeScript
npm run build

# Step 3: Run production server
npm start
```

**Environment-specific configuration:**

```bash
# Set production environment
export NODE_ENV=production

# Production-specific variables
export PORT=80
export DATABASE_URL=postgres://prod-server/db
export CORS_ORIGINS=https://yourdomain.com

# Start server
npm start
```

### Docker Production Example

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 4000

# Run production server
CMD ["npm", "start"]
```

### Testing Production Build Locally

**Before deploying, test locally:**

```bash
# 1. Clean previous build
rm -rf dist/

# 2. Fresh build
npm run build

# 3. Set production environment
export NODE_ENV=production

# 4. Start production server
npm start

# 5. Test endpoints
curl http://localhost:4000/health

# 6. Check for errors in logs
# Look for any runtime errors or warnings
```

---

## Code Quality Tools

Our project uses **three layers** of code quality assurance:

1. **TypeScript** - Type safety
2. **ESLint** - Code quality and patterns
3. **Prettier** - Code formatting

### ESLint: Code Quality & Patterns

#### What is ESLint?

**ESLint** is a static analysis tool that:
- Identifies problematic patterns in JavaScript/TypeScript
- Enforces coding standards and best practices
- Catches bugs before they reach production
- Ensures consistent code style across the team

#### Command: `npm run lint`

**What it does:**
```bash
eslint src/**/*.ts
```

Analyzes all TypeScript files in `src/` for issues.

#### ESLint Configuration

**File:** `.eslintrc.js`

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',      // Parse TypeScript syntax
  extends: [
    'eslint:recommended',                   // ESLint's recommended rules
    'plugin:@typescript-eslint/recommended' // TypeScript-specific rules
  ],
  parserOptions: {
    ecmaVersion: 2022,                      // Modern JavaScript features
    sourceType: 'module',                   // ES6 modules
    project: './tsconfig.json'              // TypeScript project config
  },
  rules: {
    // Custom rule overrides
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': 'off'                    // Allow console.log in Node.js
  }
};
```

#### Common ESLint Rules Explained

**1. `no-unused-vars` / `@typescript-eslint/no-unused-vars`**

Catches variables that are declared but never used.

```typescript
// ❌ ESLint Error: 'unusedVariable' is defined but never used
const unusedVariable = "This is never used";
const name = "John";
console.log(name);

// ✅ Fix: Remove unused variable
const name = "John";
console.log(name);
```

**Why it matters:** Unused variables indicate dead code that clutters the codebase.

**2. `@typescript-eslint/explicit-function-return-type`**

Requires explicit return types on functions.

```typescript
// ❌ ESLint Warning: Missing return type
export const getHealth = async (request, response) => {
  // Function implementation
};

// ✅ Fix: Add return type
export const getHealth = async (request: Request, response: Response): Promise<void> => {
  // Function implementation
};
```

**Why it matters:** Explicit return types improve code documentation and type safety.

**3. `@typescript-eslint/no-explicit-any`**

Discourages use of `any` type.

```typescript
// ❌ ESLint Warning: Unexpected any. Specify a different type
const processData = (data: any) => {
  return data.value;
};

// ✅ Fix: Use specific type
interface Data {
  value: string;
}

const processData = (data: Data): string => {
  return data.value;
};
```

**Why it matters:** Using `any` defeats the purpose of TypeScript's type system.

**4. `no-console`**

Warns about console.log usage (off in our project).

```typescript
// ⚠️ ESLint Warning in production code: Unexpected console statement
console.log("Debug message");

// ✅ Better: Use proper logger
logger.info("Debug message");

// Or suppress for specific lines
// eslint-disable-next-line no-console
console.log("Allowed console.log");
```

**Why it matters:** Console statements should be removed or replaced with proper logging in production.

**5. `prefer-const`**

Suggests using `const` for variables that are never reassigned.

```typescript
// ❌ ESLint Warning: 'name' is never reassigned. Use 'const' instead
let name = "John";
console.log(name);

// ✅ Fix: Use const
const name = "John";
console.log(name);
```

**Why it matters:** `const` makes code intent clearer and prevents accidental reassignment.

**6. `@typescript-eslint/no-inferrable-types`**

Discourages explicit types when TypeScript can infer them.

```typescript
// ❌ ESLint Warning: Type number trivially inferred from a number literal
const age: number = 25;

// ✅ Fix: Let TypeScript infer
const age = 25;  // TypeScript knows this is a number
```

**Why it matters:** Reduces noise and improves code readability.

**7. `eqeqeq`**

Requires strict equality (===) instead of loose equality (==).

```typescript
// ❌ ESLint Error: Expected '===' and instead saw '=='
if (value == "5") {
  // Loose equality can cause bugs
}

// ✅ Fix: Use strict equality
if (value === "5") {
  // Strict comparison
}
```

**Why it matters:** Loose equality has unexpected type coercion behavior.

#### ESLint Error Levels

- **`error`** (2) - Code fails lint check, must be fixed
- **`warn`** (1) - Shows warning but doesn't fail
- **`off`** (0) - Rule is disabled

```javascript
rules: {
  '@typescript-eslint/no-unused-vars': 'error',     // Must fix
  '@typescript-eslint/no-explicit-any': 'warn',     // Should fix
  'no-console': 'off'                               // Ignored
}
```

#### Command: `npm run lint:fix`

**What it does:**
```bash
eslint src/**/*.ts --fix
```

Automatically fixes **auto-fixable** issues.

**What can be auto-fixed:**
✅ Adding/removing semicolons
✅ Converting `let` to `const`
✅ Fixing indentation
✅ Removing unused imports
✅ Converting `==` to `===`

**What requires manual fixing:**
❌ Complex type issues
❌ Logic errors
❌ Missing function implementations
❌ Architectural problems

**Workflow:**
```bash
# Run auto-fix first
npm run lint:fix

# Then check what remains
npm run lint

# Manually fix remaining issues
# Edit source files

# Verify all issues resolved
npm run lint
```

#### Disabling ESLint Rules

**For specific lines:**
```typescript
// Disable next line
// eslint-disable-next-line no-console
console.log("Debug output");

// Disable rule for multiple lines
/* eslint-disable no-console */
console.log("Debug 1");
console.log("Debug 2");
/* eslint-enable no-console */
```

**For entire files:**
```typescript
/* eslint-disable @typescript-eslint/no-explicit-any */
// Entire file allows 'any' type
export const legacyFunction = (data: any) => {
  // Implementation
};
```

**⚠️ Use sparingly** - Disabling rules should be rare and justified.

### Prettier: Code Formatting

#### What is Prettier?

**Prettier** is an opinionated code formatter that:
- Enforces consistent code style
- Removes debates about formatting
- Formats code automatically
- Integrates with ESLint

#### Command: `npm run format`

**What it does:**
```bash
prettier --write src/**/*.ts
```

Automatically formats all TypeScript files.

#### Prettier Configuration

**File:** `.prettierrc` (if exists) or package.json

```json
{
  "semi": true,              // Add semicolons
  "singleQuote": true,       // Use single quotes
  "tabWidth": 2,             // 2 spaces per tab
  "trailingComma": "es5",    // Trailing commas where valid in ES5
  "printWidth": 100,         // Line wrap at 100 characters
  "arrowParens": "always"    // Parentheses around arrow function args
}
```

#### Formatting Examples

**Before Prettier:**
```typescript
const message={name:"John",text:"Hello",priority:1}

function processMessage(msg:MessageRequest)
{
if(msg.priority>1){return false}
    return true
}
```

**After Prettier:**
```typescript
const message = {
  name: 'John',
  text: 'Hello',
  priority: 1,
};

function processMessage(msg: MessageRequest) {
  if (msg.priority > 1) {
    return false;
  }
  return true;
}
```

#### Command: `npm run format:check`

**What it does:**
```bash
prettier --check src/**/*.ts
```

**Checks if files are formatted** without modifying them.

Useful in CI/CD to verify code is properly formatted.

```bash
# In CI/CD pipeline
npm run format:check
# Exit code 0: All files formatted correctly
# Exit code 1: Some files need formatting
```

#### ESLint + Prettier Integration

Our project integrates both tools:

**ESLint** handles:
- Code quality rules
- Best practice enforcement
- Bug detection
- TypeScript-specific patterns

**Prettier** handles:
- Code formatting
- Indentation
- Line length
- Quote style
- Semicolons

**They work together:**
```bash
# Format code
npm run format

# Then check quality
npm run lint

# Or fix both
npm run format && npm run lint:fix
```

### Complete Quality Check Workflow

**Before committing code:**

```bash
# Step 1: Format code
npm run format

# Step 2: Check TypeScript types
npm run type-check

# Step 3: Run linter
npm run lint

# Step 4: Auto-fix what can be fixed
npm run lint:fix

# Step 5: Verify build succeeds
npm run build

# Step 6: Run tests (if available)
npm test

# Now commit!
git add .
git commit -m "feat: add new feature"
```

**Quick combined check:**
```bash
npm run format && npm run type-check && npm run lint && npm run build
```

### IDE Integration

Both VS Code and WebStorm have excellent TypeScript support with built-in ESLint and Prettier integration.

#### VS Code Setup

**Install extensions:**
1. **ESLint** (dbaeumer.vscode-eslint) - Real-time linting
2. **Prettier - Code formatter** (esbenp.prettier-vscode) - Auto-format on save
3. **TypeScript Importer** (pmneo.tsimporter) - Auto-import suggestions

**Install all at once:**
```bash
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension pmneo.tsimporter
```

**Settings (.vscode/settings.json):**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.preferences.importModuleSpecifier": "non-relative"
}
```

**Benefits:**
- ✅ Automatic formatting on save
- ✅ Real-time lint errors highlighted
- ✅ Quick fixes available (Cmd+. or Ctrl+.)
- ✅ TypeScript IntelliSense
- ✅ Path alias resolution

#### WebStorm Setup

**Built-in features (no plugins needed):**
- ✅ ESLint integration (automatically detects `.eslintrc.js`)
- ✅ Prettier integration (automatically detects config)
- ✅ TypeScript support (native)
- ✅ Path alias support (reads `tsconfig.json`)
- ✅ npm script runner (right-click package.json)

**Enable ESLint:**
1. Go to **Settings/Preferences** → **Languages & Frameworks** → **JavaScript** → **Code Quality Tools** → **ESLint**
2. Check **Automatic ESLint configuration**
3. Check **Run eslint --fix on save**

**Enable Prettier:**
1. Go to **Settings/Preferences** → **Languages & Frameworks** → **JavaScript** → **Prettier**
2. Set **Prettier package:** `{project_root}/node_modules/prettier`
3. Check **On 'Reformat Code' action**
4. Check **On save**

**Configure TypeScript:**
1. Go to **Settings/Preferences** → **Languages & Frameworks** → **TypeScript**
2. Select **TypeScript version:** `{project_root}/node_modules/typescript`
3. Check **Recompile on changes**
4. Enable **TypeScript Language Service**

**Keyboard Shortcuts:**
- **Format file:** `Ctrl+Alt+L` (Windows/Linux) or `Cmd+Option+L` (Mac)
- **Show ESLint errors:** `Alt+Enter` on highlighted code
- **Auto-import:** `Alt+Enter` on unresolved symbol
- **Run npm script:** Right-click package.json → **Show npm Scripts**

**npm Script Runner:**
WebStorm shows npm scripts in the UI:
1. Open `package.json`
2. See green play buttons next to scripts
3. Click to run (or right-click for options)
4. View output in Run window

**Debugging in WebStorm:**
1. Click the dropdown next to Run button
2. Select **Edit Configurations**
3. Click **+** → **npm**
4. Set **Command:** `run`
5. Set **Scripts:** `dev`
6. Click **OK** and run with debugger

**Benefits:**
- ✅ Everything works out-of-the-box
- ✅ Integrated npm runner
- ✅ Powerful debugger
- ✅ Git integration
- ✅ Database tools (if you add a database)
- ✅ Professional IDE features

---

## Complete Workflow Examples

### Daily Development Workflow

**Scenario:** You're adding a new API endpoint

```bash
# 1. Start development server
npm run dev

# Terminal shows:
# 🚀 Message API server running on port 4000
# 📚 Environment: development
# 🔗 Health check: http://localhost:4000/health

# 2. Create new controller file
# Edit: src/controllers/newController.ts
# - TypeScript code with types
# - Save file
# - ts-node-dev automatically restarts

# 3. Test your endpoint
curl http://localhost:4000/new-endpoint

# 4. Make changes as needed
# Edit code → Auto-restart → Test → Repeat

# 5. Before committing
npm run type-check    # Check types
npm run lint          # Check code quality
npm run format        # Format code

# 6. Commit
git add src/controllers/newController.ts
git commit -m "feat: add new endpoint"
```

### Fixing a Bug Workflow

**Scenario:** You found a bug in production

```bash
# 1. Reproduce locally in dev mode
npm run dev

# 2. Identify the issue
# - Use console.log for debugging
# - Or use VS Code debugger

# 3. Fix the code
# Edit affected files
# ts-node-dev restarts automatically

# 4. Verify fix works
curl http://localhost:4000/endpoint
# Test various scenarios

# 5. Quality checks
npm run type-check    # Ensure no type errors introduced
npm run lint          # Check code quality
npm run format        # Format changes

# 6. Test production build
npm run build         # Build succeeds?
npm start             # Production mode works?

# 7. Commit fix
git add .
git commit -m "fix: resolve issue with endpoint"
```

### Pre-Deployment Workflow

**Scenario:** Preparing code for production deployment

```bash
# 1. Ensure clean working directory
git status
# Should show: nothing to commit, working tree clean

# 2. Update dependencies
npm install

# 3. Full quality check
npm run type-check    # Type safety ✓
npm run lint          # Code quality ✓
npm run format:check  # Code formatting ✓

# 4. Clean build
rm -rf dist/          # Remove old build
npm run build         # Fresh compile

# Build output:
# src/index.ts → dist/index.js
# src/app.ts → dist/app.js
# ... (all files compiled)
# ✓ Compiled successfully

# 5. Test production build locally
export NODE_ENV=production
npm start

# Test critical endpoints
curl http://localhost:4000/health
# {"success":true,"data":{"status":"OK",...}}

# 6. Create deployment artifact
tar -czf app-v1.0.0.tar.gz dist/ node_modules/ package.json

# 7. Deploy (platform-specific)
# - Upload to server
# - Extract and run
# - Or use Docker/cloud platform
```

### Adding New Features Workflow

**Scenario:** Implementing a new feature with tests

```bash
# 1. Create feature branch
git checkout -b feature/user-authentication

# 2. Start development server
npm run dev

# 3. Implement feature incrementally
# - Add types (src/types/)
# - Add utilities (src/core/utilities/)
# - Add controller (src/controllers/)
# - Add routes (src/routes/)
# - Test after each step

# 4. Write documentation
# Update relevant .md files in docs/

# 5. Quality checks at each stage
npm run type-check    # After significant changes
npm run lint          # Before committing

# 6. Final pre-merge checks
npm run format        # Format all code
npm run type-check    # Full type check
npm run lint          # Full lint check
npm run build         # Verify build

# 7. Merge to main
git add .
git commit -m "feat: add user authentication"
git push origin feature/user-authentication
# Create pull request
```

### Troubleshooting Workflow

**Scenario:** Code works in dev but fails in production

```bash
# 1. Compare dev and prod environments
echo "Dev mode:"
NODE_ENV=development npm run dev

echo "Prod mode:"
NODE_ENV=production npm run build && npm start

# 2. Check environment variables
cat .env
# Ensure production variables are set

# 3. Look for environment-specific code
grep -r "NODE_ENV" src/
# Review conditional logic

# 4. Test production build locally
rm -rf dist/
npm run build
NODE_ENV=production npm start

# 5. Check for TypeScript issues bypassed in dev
npm run type-check
# --transpile-only might have hidden type errors

# 6. Review build output
ls -la dist/
# Verify all files compiled correctly

# 7. Check logs for errors
# Look for stack traces mentioning dist/ files
# Use source maps to trace back to TypeScript

# 8. Compare JavaScript output
# View dist/controller.js
# Check if transformation is correct
```

---

## Development vs Production Comparison

### Side-by-Side Comparison

| **Aspect** | **Development Mode** (`npm run dev`) | **Production Mode** (`npm run build` + `npm start`) |
|------------|-------------------------------------|-----------------------------------------------------|
| **Command** | `ts-node-dev` | `node` |
| **Source Files** | TypeScript (`.ts`) | JavaScript (`.js`) |
| **Compilation** | In-memory, on-the-fly | Pre-compiled to `dist/` |
| **Type Checking** | Skipped (`--transpile-only`) | Full check during build |
| **Startup Speed** | Slower (compile on start) | Fast (pre-compiled) |
| **Hot Reload** | ✅ Yes (auto-restart) | ❌ No (manual restart required) |
| **File Output** | None (memory only) | `dist/` directory created |
| **Source Maps** | Generated in memory | Written to disk (`.map` files) |
| **Error Detail** | Verbose with full stacks | Minimal, production-safe |
| **Performance** | Development-optimized | Production-optimized |
| **Debugging** | TypeScript source | JavaScript source (with maps) |
| **Environment** | `NODE_ENV=development` | `NODE_ENV=production` |
| **Logging** | Detailed, all levels | Minimal, errors only |
| **CORS** | Permissive (localhost) | Restrictive (configured origins) |
| **Path Aliases** | Resolved at runtime | Resolved at compile time |
| **Optimization** | None | Minification, tree-shaking |
| **Use Case** | Active development | Deployment, production serving |
| **File Watching** | ✅ Monitors changes | ❌ No file watching |
| **Restart Time** | ~1-2 seconds | Instant (no compilation) |
| **Memory Usage** | Higher (compilation in RAM) | Lower (runs compiled code) |
| **Suitable For** | Learning, experimenting, coding | Serving real users, benchmarks |

### Visual Workflow Comparison

**Development Mode:**
```
┌─────────────────────────────────────────────────────────────┐
│                  DEVELOPMENT MODE CYCLE                     │
└─────────────────────────────────────────────────────────────┘

Start: npm run dev
     ↓
Launch ts-node-dev
     ↓
Compile TypeScript in memory (fast, no type check)
     ↓
Execute JavaScript in memory
     ↓
Server running ← → Make code changes
     ↓              ↓
Watch files → Detect change → Recompile → Restart
     ↓                                      ↓
     └──────────────────────────────────────┘
           (Continuous development loop)
```

**Production Mode:**
```
┌─────────────────────────────────────────────────────────────┐
│                  PRODUCTION MODE WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

Start: npm run build
     ↓
Run tsc (TypeScript Compiler)
     ↓
Full type checking (slow, thorough)
     ↓
Transform TypeScript → JavaScript
     ↓
Write files to dist/ directory
     ↓
Build complete
     ↓
Start: npm start
     ↓
Launch node process
     ↓
Load compiled JavaScript from dist/
     ↓
Server running (no auto-restart)
     ↓
(Manual restart required for changes)
```

### When to Use Each Mode

**Use Development Mode (`npm run dev`) when:**

✅ You're actively writing code
✅ You need fast feedback on changes
✅ You're experimenting with new features
✅ You're learning the codebase
✅ You're debugging issues
✅ You need hot-reload functionality
✅ Type errors aren't critical yet

**Use Production Mode (`npm run build` + `npm start`) when:**

✅ Deploying to production servers
✅ Testing the production build locally
✅ Running performance benchmarks
✅ Creating deployment artifacts
✅ Verifying build succeeds
✅ Testing production environment behavior
✅ Need maximum runtime performance

**Use Both:**
```bash
# During active development
npm run dev

# Before committing
npm run type-check && npm run lint

# Before deploying
npm run build
npm start  # Test locally

# After deployment
# npm start on production server
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. "Changes Aren't Showing Up"

**Symptoms:**
- Modified code but behavior unchanged
- Old version still running

**Possible Causes & Solutions:**

**Cause A: Running production mode instead of dev**
```bash
# Check what's running
ps aux | grep node

# If you see: node dist/index.js
# You're in production mode!

# Solution: Stop and restart in dev mode
pkill -f "node dist"    # Stop production
npm run dev             # Start dev mode
```

**Cause B: Cached require/imports**
```bash
# Solution: Restart development server
# Ctrl+C to stop
npm run dev
```

**Cause C: Browser caching (if testing via browser)**
```bash
# Solution: Hard refresh
# Chrome/Firefox: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
# Or open DevTools Network tab → Disable cache
```

#### 2. "npm run build Fails"

**Symptoms:**
```
error TS2322: Type 'string' is not assignable to type 'number'.
Build failed with 5 errors.
```

**Solution:**
```bash
# Step 1: Run type check to see all errors
npm run type-check

# Step 2: Fix type errors in source code
# Edit affected files

# Step 3: Verify fixes
npm run type-check

# Step 4: Try build again
npm run build
```

**Common type errors:**

**Missing types:**
```typescript
// ❌ Error
function greet(name) {  // Implicit 'any' type
  return `Hello, ${name}`;
}

// ✅ Fix
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

**Wrong types:**
```typescript
// ❌ Error
interface Message {
  priority: number;
}
const msg: Message = { priority: "high" };

// ✅ Fix
const msg: Message = { priority: 1 };
```

#### 3. "Port Already in Use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solutions:**

**Option A: Kill the process using the port**
```bash
# macOS/Linux
lsof -ti :4000 | xargs kill -9

# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**Option B: Use a different port**
```bash
# Edit .env file
PORT=3000

# Or set temporarily
PORT=3000 npm run dev
```

#### 4. "Module Not Found" Errors

**Symptoms:**
```
Error: Cannot find module '@utilities/responseUtils'
```

**Solutions:**

**Cause A: Missing path alias registration**
```bash
# Check ts-node-dev command includes:
# -r tsconfig-paths/register

# In package.json
"dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/index.ts"
```

**Cause B: Path alias not in tsconfig.json**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@utilities/*": ["core/utilities/*"],  // Must match import
      "@controllers/*": ["controllers/*"]
    }
  }
}
```

**Cause C: Missing node_modules**
```bash
# Solution: Install dependencies
npm install
```

#### 5. "TypeScript Errors in Dev Mode"

**Symptoms:**
- Code runs in `npm run dev`
- But has type errors when running `npm run type-check`

**Explanation:**
```bash
# Development mode skips type checking
npm run dev  # Uses --transpile-only flag

# Type check separately
npm run type-check  # Finds type errors
```

**Solution:**
```bash
# Always run type-check before committing
npm run type-check

# Fix reported errors
# Then verify
npm run type-check  # Should show no errors
```

#### 6. "Linting Errors"

**Symptoms:**
```
error  'unusedVariable' is assigned a value but never used  @typescript-eslint/no-unused-vars
```

**Solutions:**

**Option A: Auto-fix**
```bash
npm run lint:fix
```

**Option B: Manual fix**
```typescript
// Remove unused variable
// const unusedVariable = "test";  ← Delete this line
```

**Option C: Disable rule (rarely)**
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const debugVariable = "For debugging only";
```

#### 7. "Production Build Works but Dev Doesn't"

**Symptoms:**
- `npm run build && npm start` works
- `npm run dev` fails

**Possible Causes:**

**Cause A: Missing ts-node-dev**
```bash
# Solution: Install dev dependencies
npm install --save-dev ts-node-dev
```

**Cause B: Outdated dependencies**
```bash
# Solution: Clean install
rm -rf node_modules package-lock.json
npm install
```

#### 8. "Source Maps Not Working"

**Symptoms:**
- Debugger shows compiled JavaScript instead of TypeScript
- Stack traces reference dist/ files

**Solution:**
```json
// Ensure tsconfig.json has:
{
  "compilerOptions": {
    "sourceMap": true,
    "inlineSourceMap": false
  }
}
```

```bash
# Rebuild with source maps
npm run build

# Verify .map files created
ls dist/*.map
```

#### 9. "Environment Variables Not Loading"

**Symptoms:**
```
Error: Missing required environment variable: DB_HOST
```

**Solutions:**

**Check .env file exists:**
```bash
ls -la .env
# If not found:
cp .env.example .env
```

**Verify dotenv is loaded:**
```typescript
// At top of index.ts
import dotenv from 'dotenv';
dotenv.config();
```

**Check NODE_ENV:**
```bash
echo $NODE_ENV
# Should match your .env file
```

#### 10. "Build Succeeds but Runtime Errors"

**Symptoms:**
- `npm run build` completes without errors
- `npm start` has runtime errors

**Common Causes:**

**Missing runtime dependencies:**
```bash
# Ensure all dependencies installed
npm ci --only=production
```

**Environment mismatch:**
```bash
# Set correct environment
export NODE_ENV=production

# Check configuration
node -e "console.log(process.env.NODE_ENV)"
```

**Path alias issues in build:**
```bash
# Check compiled output
cat dist/controllers/healthController.js
# Verify paths resolved correctly

# Rebuild if needed
npm run build
```

---

## Advanced Topics

### Watch Mode

**Both TypeScript and development server support watch mode:**

```bash
# TypeScript watch mode - recompile on changes
npm run build:watch

# Development watch mode - restart on changes
npm run dev  # Already includes watch mode
```

**Build watch mode workflow:**
```bash
# Terminal 1: Watch compilation
npm run build:watch

# Terminal 2: Run compiled code
npm start

# Edit files → Auto-recompile → Manually restart Terminal 2
```

### Incremental Compilation

TypeScript supports incremental compilation for faster builds:

```json
// tsconfig.json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": "./dist/.tsbuildinfo"
  }
}
```

**Benefits:**
- Faster subsequent builds
- Only recompiles changed files
- Stores build state in `.tsbuildinfo`

### Debugging Compiled Code

**Using VS Code debugger:**

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "sourceMaps": true
    },
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Production Build",
      "program": "${workspaceFolder}/dist/index.js",
      "preLaunchTask": "npm: build",
      "sourceMaps": true,
      "smartStep": true
    }
  ]
}
```

### Performance Optimization

**Build performance tips:**

```bash
# Use skipLibCheck for faster compilation
# tsconfig.json:
{
  "compilerOptions": {
    "skipLibCheck": true  // Skip type checking node_modules
  }
}

# Use incremental builds
{
  "compilerOptions": {
    "incremental": true
  }
}

# Limit scope
{
  "include": ["src/**/*"],       # Only compile src/
  "exclude": ["node_modules"]    # Skip node_modules
}
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Test

on: [push, pull_request]

jobs:
  quality-checks:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Format check
        run: npm run format:check

      - name: Build
        run: npm run build

      - name: Test
        run: npm test

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/
```

---

## Further Reading

**TypeScript:**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Official TypeScript documentation
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) - Comprehensive guide

**Build Tools:**
- [ts-node Documentation](https://typestrong.org/ts-node/) - TypeScript execution
- [ts-node-dev Documentation](https://github.com/wclr/ts-node-dev) - Development server

**Code Quality:**
- [ESLint Documentation](https://eslint.org/docs/latest/) - Linting rules and configuration
- [Prettier Documentation](https://prettier.io/docs/en/) - Code formatting

**Related Guides:**
- [Node.js & Express Architecture](./node-express-architecture.md) - Application structure
- [TypeScript Patterns](./typescript-patterns.md) - Type system usage
- [Environment Configuration](./environment-configuration.md) - Configuration management
- [Testing Strategies](./testing-strategies.md) - Testing approaches

---

*Understanding the development workflow and build process is fundamental to working effectively with modern TypeScript projects. These patterns and practices ensure code quality, type safety, and smooth deployment.*
