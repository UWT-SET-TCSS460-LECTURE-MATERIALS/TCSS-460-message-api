/**
 * EXPRESS APPLICATION CONFIGURATION - EDUCATIONAL OVERVIEW
 *
 * What is Express.js?
 * ==================
 * Express.js is a web framework for Node.js that simplifies building web servers and APIs.
 * It provides a thin layer of web application features without obscuring Node.js features.
 * Think of it as the foundation that handles HTTP requests and responses for you.
 *
 * Application vs Server:
 * =====================
 * Important distinction for beginners:
 * - APPLICATION (this file): Defines how to handle requests (routes, middleware, error handling)
 * - SERVER (index.ts): Actually listens on a port and accepts incoming connections
 *
 * This separation allows you to:
 * ✅ Test your application logic without starting a server
 * ✅ Use the same app configuration with different servers (HTTP, HTTPS, test servers)
 * ✅ Deploy to different platforms that manage the server for you
 *
 * Middleware Pattern:
 * ==================
 * Express uses "middleware" - functions that execute in sequence for each request.
 * Each middleware can:
 * - Modify the request/response objects
 * - End the request-response cycle
 * - Call the next middleware in the stack
 *
 * Middleware Stack (order matters!):
 * 1. CORS - Handles cross-origin requests (browser security)
 * 2. JSON Parser - Converts JSON request bodies to JavaScript objects
 * 3. URL Encoder - Handles form data from HTML forms
 * 4. Routes - Your business logic (message operations)
 * 5. Error Handler - Catches and formats errors
 *
 * CORS (Cross-Origin Resource Sharing):
 * ====================================
 * Browsers have a security feature that blocks requests between different domains.
 * CORS middleware tells browsers: "It's okay to make requests to this API from web pages."
 *
 * Without CORS:
 * ❌ Frontend running on localhost:3000 can't call API on localhost:4000
 * ❌ Production website can't call your API
 *
 * With CORS:
 * ✅ Any website can make requests to your API
 * ✅ Modern web applications work as expected
 *
 * JSON Parsing:
 * =============
 * HTTP requests send data as strings. The JSON middleware automatically:
 * - Detects "Content-Type: application/json" headers
 * - Parses JSON strings into JavaScript objects
 * - Makes them available as request.body
 *
 * Error Handling:
 * ===============
 * Express error middleware catches errors that occur during request processing.
 * Instead of crashing your server, errors are caught and formatted into proper HTTP responses.
 * This keeps your API running even when individual requests fail.
 *
 * Health Checks:
 * ==============
 * Production APIs include "health check" endpoints that monitoring systems can call
 * to verify the service is running properly. Simple but essential for DevOps.
 *
 * The createApp() function below demonstrates industry-standard Express.js patterns
 * used in production applications worldwide.
 */

import express from 'express';
import cors from 'cors';
// TODO: Add Swagger documentation setup
// import swaggerUi from 'swagger-ui-express';
// import YAML from 'yamljs';
// import path from 'path';
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

    // API Documentation (will be added later)
    // const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
    // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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
            const { ErrorCodes } = require('./core/utilities/errorCodes');
            sendError(response, 400, "Malformed JSON in request body - please check your JSON syntax", ErrorCodes.MSG_MALFORMED_JSON);
            return;
        }
        next(error);
    });

    return app;
};

// Export configured app instance
export const app = createApp();