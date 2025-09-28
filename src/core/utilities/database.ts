import { Pool, PoolConfig } from 'pg';
import { getEnvVar } from './envConfig';

let pool: Pool | null = null;

/**
 * Create database configuration based on environment
 * Handles both development (individual config vars) and production (connection string) setups
 * Development uses localhost with individual parameters, production uses DATABASE_URL with SSL
 *
 * @returns PoolConfig object for PostgreSQL connection pool
 * @throws Will throw error if required environment variables are missing
 * @example
 * // Development config created automatically:
 * // { host: 'localhost', port: 5432, user: 'postgres', database: 'message_db', ... }
 *
 * // Production config created automatically:
 * // { connectionString: 'postgres://...', ssl: { rejectUnauthorized: false } }
 */
const createDatabaseConfig = (): PoolConfig => {
    const nodeEnv = getEnvVar('NODE_ENV', 'development');

    if (nodeEnv === 'production') {
        return {
            connectionString: getEnvVar('DATABASE_URL'),
            ssl: { rejectUnauthorized: false }
        };
    }

    return {
        host: getEnvVar('DB_HOST', 'localhost'),
        port: parseInt(getEnvVar('DB_PORT', '5432')),
        user: getEnvVar('DB_USER', 'postgres'),
        password: getEnvVar('DB_PASSWORD', 'password'),
        database: getEnvVar('DB_NAME', 'message_db'),
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
    };
};

/**
 * Establish connection to PostgreSQL database
 * Creates connection pool with environment-specific configuration and tests connectivity
 * Prevents multiple connection attempts by checking existing pool state
 *
 * @returns Promise<void>
 * @throws Will throw error if database connection fails
 * @throws Will throw error if required environment variables are missing
 * @example
 * // Called during application startup
 * try {
 *   await connectToDatabase();
 *   console.log('Database ready for queries');
 * } catch (error) {
 *   console.error('Failed to connect to database:', error);
 *   process.exit(1);
 * }
 */
export const connectToDatabase = async (): Promise<void> => {
    if (pool) {
        console.log('Database connection already exists');
        return;
    }

    const config = createDatabaseConfig();
    pool = new Pool(config);

    try {
        const client = await pool.connect();
        console.log('Database connection test successful');
        client.release();
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
};

/**
 * Gracefully disconnect from PostgreSQL database
 * Closes all connections in the pool and cleans up resources
 * Safe to call multiple times - will not error if already disconnected
 *
 * @returns Promise<void>
 * @example
 * // Called during application shutdown
 * process.on('SIGTERM', async () => {
 *   console.log('Shutting down gracefully...');
 *   await disconnectFromDatabase();
 *   process.exit(0);
 * });
 */
export const disconnectFromDatabase = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        pool = null;
        console.log('Database connection closed');
    }
};

/**
 * Get the active PostgreSQL connection pool
 * Provides access to database pool for query execution throughout the application
 * Ensures database is connected before allowing queries
 *
 * @returns Pool - Active PostgreSQL connection pool
 * @throws Will throw error if database is not connected (pool is null)
 * @example
 * // Used in controllers for database operations
 * const pool = getPool();
 * const result = await pool.query('SELECT * FROM messages WHERE priority = $1', [1]);
 * console.log(`Found ${result.rows.length} messages`);
 */
export const getPool = (): Pool => {
    if (!pool) {
        throw new Error('Database not connected. Call connectToDatabase() first.');
    }
    return pool;
};

// Legacy export for backward compatibility
export { pool };