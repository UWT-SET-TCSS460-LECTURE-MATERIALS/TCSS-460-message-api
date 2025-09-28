import { connectToDatabase, disconnectFromDatabase } from '@db';

beforeAll(async () => {
    await connectToDatabase();
});

afterAll(async () => {
    await disconnectFromDatabase();
});