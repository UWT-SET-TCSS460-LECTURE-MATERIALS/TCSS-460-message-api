import { connectToDatabase, disconnectFromDatabase } from '@db';

beforeAll(async () => {
    // Only connect to database if it's available (for integration tests)
    // Unit tests of pure functions don't need database connection
    try {
        await connectToDatabase();
    } catch (error) {
        // Database not available - tests requiring DB will fail appropriately
        // Pure utility tests will still pass
        console.log('Database not available for tests - skipping connection');
    }
});

afterAll(async () => {
    try {
        await disconnectFromDatabase();
    } catch (error) {
        // Database wasn't connected - no cleanup needed
    }
});