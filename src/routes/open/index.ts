import { Router } from 'express';
import { messageRoutes } from './messageRoutes';
import { docsRoutes } from './docsRoutes';

export const openRoutes = Router();

// Health check endpoint
openRoutes.get('/health', (request, response) => {
    response.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Message API routes
openRoutes.use('/message', messageRoutes);

// Documentation routes
openRoutes.use('/doc', docsRoutes);