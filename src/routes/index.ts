/**
 * ROUTING SYSTEM - EDUCATIONAL OVERVIEW
 *
 * What is Routing in Web Applications?
 * ===================================
 * Routing is the mechanism that determines how an application responds to client requests
 * to specific endpoints. Each endpoint is defined by a URL path and HTTP method (GET, POST, etc.).
 * Routes act as the "front door" of your API, directing incoming requests to the appropriate handlers.
 *
 * HTTP Methods and Their Purposes:
 * ===============================
 * GET    - Retrieve data (read operations) - should not modify server state
 * POST   - Create new resources - sends data in request body
 * PUT    - Update entire resources - replaces existing data
 * PATCH  - Partial updates - modifies specific fields
 * DELETE - Remove resources - permanent deletion
 *
 * REST API Route Patterns:
 * =======================
 * REST (Representational State Transfer) uses predictable URL patterns:
 *
 * GET    /message           - Get all messages
 * GET    /message?priority=1 - Get messages filtered by query parameter
 * GET    /message/:name     - Get specific message by name (path parameter)
 * POST   /message           - Create new message
 * PATCH  /message           - Update existing message
 * DELETE /message/:name     - Delete specific message
 * DELETE /message?priority=2 - Delete messages by query parameter
 *
 * Route Organization Strategies:
 * =============================
 * Large applications organize routes into logical groups:
 *
 * 1. BY FEATURE:
 *    - /message routes (message operations)
 *    - /user routes (user management)
 *    - /auth routes (authentication)
 *
 * 2. BY ACCESS LEVEL:
 *    - /open routes (public, no authentication required)
 *    - /protected routes (require authentication)
 *    - /admin routes (require admin privileges)
 *
 * 3. BY VERSION:
 *    - /v1/message (version 1 API)
 *    - /v2/message (version 2 API with breaking changes)
 *
 * Express Router Pattern:
 * ======================
 * Express Router allows you to create modular, mountable route handlers:
 *
 * 1. Create separate Router instances for different concerns
 * 2. Define routes on each Router
 * 3. Mount Routers on the main application with app.use()
 *
 * Benefits:
 * ✅ Modularity: Routes are organized into logical files
 * ✅ Reusability: Routers can be mounted at different paths
 * ✅ Maintainability: Related routes are grouped together
 * ✅ Testing: Route groups can be tested independently
 *
 * Middleware in Routing:
 * =====================
 * Routes can have middleware that runs before the final handler:
 *
 * router.post('/message',
 *   validateCreateMessage,  // Middleware: validates input
 *   createMessage          // Handler: executes business logic
 * );
 *
 * Authentication vs Authorization Routes:
 * ======================================
 * OPEN ROUTES (No Authentication):
 * - Health checks, API information
 * - Public data that anyone can access
 * - Login/registration endpoints
 *
 * PROTECTED ROUTES (Authentication Required):
 * - User-specific data and operations
 * - Sensitive business operations
 * - Administrative functions
 *
 * Route Mounting and Path Composition:
 * ===================================
 * When you mount a router, paths are combined:
 *
 * app.use('/api', routes);           // Main mount point
 * routes.use('/protected', closedRoutes); // Nested mount
 *
 * Final path: /api/protected/someEndpoint
 *
 * This creates a hierarchical URL structure that's easy to understand and maintain.
 *
 * The routing system below demonstrates these patterns for the Message API.
 */

import { Router } from 'express';
import { openRoutes } from './open';
import { closedRoutes } from './closed';

export const routes = Router();

// Public routes (no authentication required) - mounted directly for OpenAPI compliance
routes.use('/', openRoutes);

// Protected routes (authentication required)
routes.use('/protected', closedRoutes);

// API information
routes.get('/api-info', (request, response) => {
    response.json({
        name: 'TCSS 460 Message API',
        version: '1.0.0',
        description: 'RESTful API for managing message entries with name, message content, and priority levels',
        documentation: '/api-docs'
    });
});