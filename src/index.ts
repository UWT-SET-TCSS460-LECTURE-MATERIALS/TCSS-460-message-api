/**
 * Application entry point with production-ready lifecycle management
 *
 * Handles startup sequence (environment validation, database connection),
 * HTTP server initialization, and graceful shutdown with proper signal
 * handling for cloud deployment environments.
 *
 * @see {@link ../docs/node-express-architecture.md#application-lifecycle} for lifecycle concepts
 * @see {@link ../docs/environment-configuration.md} for configuration patterns
 * @see {@link ../docs/node-express-architecture.md#signal-handling} for graceful shutdown
 */

import { app } from './app';
import { connectToDatabase, disconnectFromDatabase } from '@db';
import { validateEnv, isProduction } from '@utilities/envConfig';

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
 * // 🚀 Server running on port 4000
 * // 📖 API Documentation (Swagger): http://localhost:4000/api-docs
 * // 📚 Educational Documentation: http://localhost:4000/doc
 * // 🔑 Generate API Key: http://localhost:4000/api-key
 * // 🔍 Health check: http://localhost:4000/health
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
            // Determine base URL based on environment
            const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;

            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📖 API Documentation (Swagger): ${baseUrl}/api-docs`);
            console.log(`📚 Educational Documentation: ${baseUrl}/doc`);
            console.log(`🔑 Generate API Key: ${baseUrl}/api-key`);
            console.log(`🔍 Health check: ${baseUrl}/health`);
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