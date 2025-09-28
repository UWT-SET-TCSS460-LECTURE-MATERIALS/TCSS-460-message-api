/**
 * Express routing system with modular organization and access control
 *
 * Implements RESTful routing patterns with separation between open (public)
 * and protected (authenticated) endpoints. Uses Express Router for modular
 * route organization and middleware composition.
 *
 * @see {@link ../../docs/node-express-architecture.md#routing-patterns} for routing concepts
 * @see {@link ../../docs/api-design-patterns.md#restful-api-design} for REST patterns
 * @see {@link ../../docs/node-express-architecture.md#middleware-system} for middleware usage
 * @example
 * // Route mounting creates hierarchical paths
 * app.use('/api', routes);              // /api/*
 * routes.use('/protected', closedRoutes); // /api/protected/*
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