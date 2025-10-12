/**
 * Express application factory with production-ready middleware configuration
 *
 * Configures CORS, body parsing, routing, and error handling for secure API operations.
 * Implements standard middleware patterns with proper ordering and health monitoring
 * endpoints for production deployment environments.
 *
 * @see {@link ../docs/node-express-architecture.md#expressjs-fundamentals} for Express concepts
 * @see {@link ../docs/node-express-architecture.md#middleware-system} for middleware patterns
 * @see {@link ../docs/web-security-guide.md#cors-configuration} for CORS security
 * @returns Configured Express application instance ready for server binding
 * @example
 * // Application factory pattern
 * import { app } from './app';
 * const server = app.listen(4000, () => console.log('Server ready'));
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { routes } from './routes';

/**
 * Create and configure Express application with complete middleware stack
 * Sets up CORS, JSON parsing, routes, health check, and error handling for educational Message API
 * Follows TCSS-460 framework patterns with consistent response formatting and error handling
 *
 * @returns express.Application - Fully configured Express app ready for HTTP server attachment
 * @example
 * // Used during application startup
 * const app = createApp();
 * const server = app.listen(4000, () => {
 *   console.log('Server running on port 4000');
 * });
 * @example
 * // Middleware stack configured automatically:
 * // 1. CORS enabled for cross-origin requests
 * // 2. JSON parser with 10MB limit for request bodies
 * // 3. URL-encoded form data parser
 * // 4. All message API routes mounted at root level
 * // 5. Health check endpoint at /health
 * // 6. Global JSON syntax error handler
 */
export const createApp = (): express.Application => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Serve static files from public directory
    app.use(express.static(path.join(__dirname, '../public')));

    // API Documentation - Swagger UI
    const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

    // Routes - mount directly to match OpenAPI specification
    app.use('/', routes);

    // Health check at root level
    app.get('/health', (request, response) => {
        response.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Global error handler for malformed JSON
    app.use((error: Error, request: express.Request, response: express.Response, next: express.NextFunction) => {
        if (error instanceof SyntaxError && error.message.includes('JSON')) {
            const { sendError } = require('./core/utilities/responseUtils');
            const { ErrorCodes } = require('./types/errorTypes');
            sendError(response, 400, "Malformed JSON in request body - please check your JSON syntax", ErrorCodes.MSG_MALFORMED_JSON);
            return;
        }
        next(error);
    });

    return app;
};

// Export configured app instance
export const app = createApp();