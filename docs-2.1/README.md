# docs-2.1: Implementation Planning Documentation

## Overview

This folder contains planning documentation for future implementations and enhancements to the TCSS-460 Message API project.

**Purpose:** Maintain comprehensive implementation plans for new features, authentication systems, and architectural changes before development begins. This ensures well-documented, educational implementations that students can learn from.

---

## ✅ Completed Work

The following migrations and implementations have been **completed** and their plan files removed:

### **HelloWorld → Message API Migration**
- ✅ **All 18 critical endpoint reference issues fixed** across docs-2.0/
  - Fixed `/hello` → `/health` or `/message` references
  - Fixed `/parameters/*` → `/message` references
  - Fixed `/api/v1/` prefix issues (routes are at root level)
- ✅ **Port updates**: `localhost:8000` → `localhost:4000`
- ✅ **Project name updates**: "HelloWorld API" → "Message API"
- ✅ **All code examples updated** to reference actual Message API implementation

### **Additional Documentation Integration**
- ✅ **3 comprehensive guides copied** from `docs/` to `docs-2.0/`:
  - `web-security-guide.md` - XSS, SQL injection, authentication concepts
  - `validation-strategies.md` - Input validation and sanitization
  - `database-fundamentals.md` - Database transactions, ACID properties
- ✅ **38 strategic cross-reference links added** across 15 existing documentation files
- ✅ **All links verified** and navigation flow tested

### **Documentation Route Implementation**
- ✅ **`/doc` endpoint created** serving all markdown files from docs-2.0/
  - Markdown → HTML rendering with syntax highlighting
  - Raw markdown access at `/doc/raw/{filename}`
  - Auto-generated index at `/doc`
- ✅ **Educational utilities implemented**:
  - `markdownUtils.ts` for rendering
  - GitHub-style CSS for documentation
  - Navigation header with links

### **Swagger/OpenAPI Documentation**
- ✅ **Complete `swagger.yaml` created** with all 8 Message API endpoints
- ✅ **Swagger UI enabled** at `/api-docs`
- ✅ **Full schema definitions** for requests/responses
- ✅ **Server startup logs updated** to show documentation endpoints

---

## 📋 Active Plans

### **1. API_KEY_AUTHENTICATION_PLAN.md**
**Status:** Ready for implementation (NOT YET STARTED)

**Purpose:** Implement simple API key authentication for educational purposes to complement JWT learning from credentialing server.

**What It Includes:**
- Complete 6-phase implementation plan
- Database schema for `api_keys` table
- API key generation page at `/api-key` with HTML form
- Authentication middleware (`apiKeyAuth.ts`)
- Protected message routes under `/protected/message/*`
- Swagger documentation updates
- **Educational guide:** `authentication-guide.md` comparing API Keys vs JWT

**Learning Objectives:**
- Understand stateful (API key) vs stateless (JWT) authentication
- Implement database-backed authentication
- Learn when to use API keys vs JWTs
- Practice middleware patterns for request interception
- Explore authentication lifecycle (generation → usage → revocation)

**Estimated Time:**
- Core implementation (Phases 1-5): 8-12 hours
- Educational documentation (Phase 6): 3-4 hours
- **Total: 11-16 hours**

**Why API Keys Instead of JWT?**
Since students will learn JWT from the credentialing server, using API keys here provides:
- Complementary learning (stateful vs stateless)
- Appropriate for service-to-service authentication
- Simpler to understand and implement
- Real-world relevance (Google APIs, Stripe, GitHub use API keys)

---

## Current Documentation Structure

### **docs-2.0/** (Educational Documentation - Production Ready)
All 20 markdown files have been migrated to Message API references:
- ✅ Core HTTP concepts (fundamentals, methods, status codes)
- ✅ Architecture patterns (client-server, request-response, MVC)
- ✅ Development guides (testing, workflow, TypeScript)
- ✅ Security & validation (web security, validation strategies)
- ✅ Database fundamentals (transactions, pooling, optimization)
- ✅ Comprehensive API documentation

**Access:** http://localhost:4000/doc

### **docs/** (Original Documentation - Reference Only)
Original production-focused documentation, now superseded by docs-2.0/ for educational purposes.

### **docs-2.1/** (This Folder - Planning)
Implementation plans for future features and enhancements.

---

## Server Endpoints

When you run `npm run dev`, the following documentation is available:

```
🚀 Server running on port 4000
📖 API Documentation (Swagger): http://localhost:4000/api-docs
📚 Educational Documentation: http://localhost:4000/doc
🔍 Health check: http://localhost:4000/health
```

---

## Next Steps

### **To Implement API Key Authentication:**

1. **Review the plan:** Read `API_KEY_AUTHENTICATION_PLAN.md`
2. **Phase 1:** Set up database schema and types
3. **Phase 2:** Create API key generation page
4. **Phase 3:** Implement authentication middleware
5. **Phase 4:** Create protected routes
6. **Phase 5:** Update Swagger documentation
7. **Phase 6:** Write educational guide comparing API Keys vs JWT

### **For Future Enhancements:**

When adding new features, create a detailed implementation plan in this folder following the structure of `API_KEY_AUTHENTICATION_PLAN.md`:
- Clear overview and learning objectives
- Detailed phase-by-phase implementation steps
- Code examples and file structure
- Educational documentation requirements
- Testing strategy
- Time estimates

---

## File Summary

```
docs-2.1/
├── README.md                           # This file - directory overview
└── API_KEY_AUTHENTICATION_PLAN.md      # Active plan for API key auth
```

---

**Created:** 2025-10-09
**Last Updated:** 2025-10-09
**Status:** Documentation migration complete, API key auth plan ready for implementation
