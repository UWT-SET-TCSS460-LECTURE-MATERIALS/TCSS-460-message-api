import { Router } from 'express';
import { messageRoutes } from './messageRoutes';

export const openRoutes = Router();

// Health check endpoint
openRoutes.get('/health', (request, response) => {
    response.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Message API routes
openRoutes.use('/message', messageRoutes);