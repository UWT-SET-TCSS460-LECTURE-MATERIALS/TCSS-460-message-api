/**
 * APPLICATION ENTRY POINT - EDUCATIONAL OVERVIEW
 *
 * What is an Application Entry Point?
 * ==================================
 * This file is the main entry point for the entire Node.js application. When you run "npm start",
 * Node.js executes this file first. Think of it as the "main()" function in other programming languages.
 *
 * Application Lifecycle Management:
 * ================================
 * A production web server needs to handle its entire lifecycle properly:
 *
 * 1. STARTUP SEQUENCE:
 *    - Validate environment configuration
 *    - Connect to external resources (database, Redis, etc.)
 *    - Start the HTTP server
 *    - Begin accepting client requests
 *
 * 2. RUNTIME OPERATIONS:
 *    - Process incoming HTTP requests
 *    - Execute business logic
 *    - Return responses to clients
 *
 * 3. SHUTDOWN SEQUENCE:
 *    - Stop accepting new requests
 *    - Finish processing existing requests
 *    - Close database connections
 *    - Clean up resources
 *    - Exit process
 *
 * Why Graceful Shutdown Matters:
 * ==============================
 * In production environments (cloud platforms, Docker containers), your application
 * will receive shutdown signals (SIGTERM, SIGINT). If you don't handle these properly:
 *
 * ❌ Database connections might be left open (resource leaks)
 * ❌ In-flight requests might be terminated mid-processing
 * ❌ Data might be lost or corrupted
 * ❌ Users might see "connection reset" errors
 *
 * ✅ Proper shutdown ensures data integrity and good user experience
 *
 * Environment Variables & Configuration:
 * =====================================
 * Modern applications are configured through environment variables, not hardcoded values.
 * This allows the same code to run in different environments:
 *
 * - Development: localhost database, debug logging, hot reloading
 * - Testing: in-memory database, detailed logs, mock services
 * - Production: cloud database, minimal logging, monitoring enabled
 *
 * Signal Handling (DevOps Concepts):
 * ==================================
 * SIGTERM: "Please terminate gracefully" - sent by process managers
 * SIGINT:  "User interrupt" - sent when you press Ctrl+C
 *
 * Production deployment platforms (Heroku, AWS, Docker) send SIGTERM
 * when they need to restart or redeploy your application.
 *
 * The startServer() function below demonstrates production-ready patterns
 * that will serve you well in senior-level coursework and your career.
 */

import { app } from './app';
import { connectToDatabase, disconnectFromDatabase } from '@db';
import { validateEnv } from '@utilities/envConfig';

const PORT = process.env.PORT || 4000;

/**
 * Start the Express server with complete application lifecycle management
 * Handles environment validation, database connection, HTTP server startup, and graceful shutdown
 * Includes signal handlers for production deployment scenarios (SIGTERM, SIGINT)
 *
 * @returns Promise<void> - Does not return; runs until process termination
 * @throws Will exit process with code 1 if startup fails at any stage
 * @throws Will exit process with code 0 after successful graceful shutdown
 * @example
 * // Called automatically when application starts
 * await startServer();
 * // Console output:
 * // ✅ Environment variables validated successfully
 * // ✅ Database connection established successfully
 * // 🚀 Server running on port 8000
 * // 📚 API Documentation: http://localhost:8000/api-docs
 * // 🔍 Health check: http://localhost:8000/health
 * @example
 * // Graceful shutdown on SIGTERM (production deployment)
 * // SIGTERM received. Starting graceful shutdown...
 * // HTTP server closed
 * // Database connection closed
 * // Graceful shutdown complete
 */
async function startServer() {
    try {
        // Validate environment variables
        validateEnv();
        console.log('✅ Environment variables validated successfully');

        // Connect to database
        await connectToDatabase();
        console.log('✅ Database connection established successfully');

        // Start HTTP server
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🔍 Health check: http://localhost:${PORT}/health`);
        });

        // Graceful shutdown handling
        /**
         * Handle graceful shutdown when receiving termination signals
         * Closes HTTP server and database connections cleanly
         *
         * @param signal - The termination signal received (SIGTERM, SIGINT)
         * @returns Promise that resolves when shutdown is complete
         */
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n${signal} received. Starting graceful shutdown...`);

            server.close(async () => {
                console.log('HTTP server closed');

                await disconnectFromDatabase();
                console.log('Database connection closed');

                console.log('Graceful shutdown complete');
                process.exit(0);
            });
        };

        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();