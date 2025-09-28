import { Router } from 'express';

export const closedRoutes = Router();

// Apply authentication middleware to all closed routes
// closedRoutes.use(authMiddleware);

// Placeholder for future protected routes
// closedRoutes.get('/profile', ExampleController.getProfile);
// closedRoutes.post('/resources', ExampleController.createResource);