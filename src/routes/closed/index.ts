import { Router } from 'express';
import { protectedMessageRoutes } from './messageRoutes';

export const closedRoutes = Router();

// Protected message routes (require API key authentication)
// Authentication is applied within the messageRoutes module
closedRoutes.use('/message', protectedMessageRoutes);