/**
 * Environment configuration management with multi-environment support
 *
 * Handles secure loading and validation of environment variables from .env files
 * with proper fallback handling and startup validation. Supports development,
 * testing, and production configurations with type-safe access patterns.
 *
 * @see {@link ../../docs/environment-configuration.md#environment-variables} for configuration concepts
 * @see {@link ../../docs/environment-configuration.md#dotenv-patterns} for .env file patterns
 * @see {@link ../../docs/environment-configuration.md#security-practices} for security best practices
 * @see {@link ../../docs/environment-configuration.md#multi-environment-setup} for environment types
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment-specific .env file
const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;
const envPath = path.resolve(process.cwd(), envFile);

dotenv.config({ path: envPath });

// Also load default .env if it exists
dotenv.config();

/**
 * Get environment variable with optional default value and error handling
 * Provides safe access to environment variables with fallback and validation
 * Throws descriptive error if required variable is missing
 *
 * @param key - Environment variable name to retrieve
 * @param defaultValue - Optional fallback value if variable is not set
 * @returns Environment variable value or default value
 * @throws Error if variable is not set and no default is provided
 * @example
 * // Required variable (will throw if not set)
 * const dbHost = getEnvVar('DB_HOST');
 * @example
 * // Optional variable with default
 * const port = getEnvVar('PORT', '3000');
 * const environment = getEnvVar('NODE_ENV', 'development');
 * @example
 * // Usage in configuration
 * const databaseConfig = {
 *   host: getEnvVar('DB_HOST'),           // Required
 *   port: getEnvVar('DB_PORT', '5432'),  // Optional with default
 *   database: getEnvVar('DB_NAME')       // Required
 * };
 */
export const getEnvVar = (key: string, defaultValue?: string): string => {
    const value = process.env[key];

    if (value !== undefined) {
        return value;
    }

    if (defaultValue !== undefined) {
        return defaultValue;
    }

    throw new Error(`Environment variable ${key} is required but not set`);
};

/**
 * Check if application is running in development mode
 * Development mode typically enables debugging, hot reloading, and relaxed security
 * Defaults to true if NODE_ENV is not set (safe for local development)
 *
 * @returns boolean indicating if running in development mode
 * @example
 * if (isDevelopment()) {
 *   console.log('Debug information:', debugData);
 *   app.use(errorHandler({ dumpExceptions: true }));
 * }
 * @example
 * // Conditional feature enabling
 * const corsOptions = {
 *   origin: isDevelopment() ? '*' : 'https://myapp.com'
 * };
 */
export const isDevelopment = (): boolean => {
    return getEnvVar('NODE_ENV', 'development') === 'development';
};

/**
 * Check if application is running in production mode
 * Production mode enables optimizations, security features, and minimal logging
 * Only returns true if NODE_ENV is explicitly set to 'production'
 *
 * @returns boolean indicating if running in production mode
 * @example
 * if (isProduction()) {
 *   // Enable security features
 *   app.use(helmet());
 *   app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
 * }
 * @example
 * // Environment-specific logging
 * const logLevel = isProduction() ? 'error' : 'debug';
 * logger.level = logLevel;
 */
export const isProduction = (): boolean => {
    return getEnvVar('NODE_ENV', 'development') === 'production';
};

/**
 * Validate that all required environment variables are present and accessible
 * Performs startup validation to ensure application has all necessary configuration
 * Should be called early in application lifecycle before attempting to use variables
 * Supports both individual database config vars (development) and DATABASE_URL (production/Heroku)
 *
 * @returns void (throws error if validation fails)
 * @throws Error with list of missing variables if any are not set
 * @example
 * // Called during application startup
 * try {
 *   validateEnv();
 *   console.log('✅ Environment variables validated successfully');
 * } catch (error) {
 *   console.error('❌ Environment validation failed:', error.message);
 *   process.exit(1);
 * }
 * @example
 * // In a startup sequence
 * async function startApplication() {
 *   validateEnv();                    // Validate config first
 *   await connectToDatabase();        // Then connect to services
 *   startHttpServer();               // Finally start accepting requests
 * }
 */
export const validateEnv = (): void => {
    const nodeEnv = getEnvVar('NODE_ENV', 'development');

    // Production requires DATABASE_URL (Heroku style)
    if (nodeEnv === 'production') {
        try {
            getEnvVar('DATABASE_URL');
        } catch {
            throw new Error('Missing required environment variable: DATABASE_URL (required in production)');
        }
        return;
    }

    // Development requires individual database config variables
    const requiredVars = [
        'DB_HOST',
        'DB_PORT',
        'DB_USER',
        'DB_PASSWORD',
        'DB_NAME'
    ];

    const missing = requiredVars.filter(varName => {
        try {
            getEnvVar(varName);
            return false;
        } catch {
            return true;
        }
    });

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};