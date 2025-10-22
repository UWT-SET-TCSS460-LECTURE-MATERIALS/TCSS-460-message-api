/**
 * Protected Message Routes (API Key Required)
 *
 * Duplicate of open message routes but with API key authentication required.
 * Educational demonstration of protected endpoints using stateful authentication.
 *
 * All routes require X-API-Key header for authentication.
 *
 * Educational Focus:
 * - Shows how to protect routes with authentication middleware
 * - Same functionality as public routes, different access control
 * - Demonstrates middleware composition (validation + authentication)
 */

import {NextFunction, Request, Response, Router} from 'express';
import {
    createMessage,
    getMessagesByPriority,
    updateMessage,
    deleteMessagesByPriority,
    getAllMessages,
    getMessageByName,
    deleteMessageByName,
    getAllMessagesPaginated,
    getMessagesByPriorityPaginated
} from '@controllers/messageController';
import {
    validateCreateMessage,
    validateUpdateMessage,
    validatePriorityQuery,
    validateNameParam,
    validatePaginationParams
} from '@middleware/messageValidation';
import { apiKeyAuth } from '@middleware/apiKeyAuth';
import {AuthenticatedRequest} from "@/types";

export const protectedMessageRoutes = Router();

// Apply API key authentication to all routes in this router
protectedMessageRoutes.use(apiKeyAuth);

/**
 * POST /protected/message - Create a new message entry (protected)
 * Requires: X-API-Key header
 * Validation: validateCreateMessage
 */
protectedMessageRoutes.post('/', validateCreateMessage, createMessage);

/**
 * PATCH /protected/message - Update an existing message (protected)
 * Requires: X-API-Key header
 * Validation: validateUpdateMessage
 */
protectedMessageRoutes.patch('/', validateUpdateMessage, updateMessage);

/**
 * GET /protected/message/all/paginated - Get all messages with pagination (protected)
 * Requires: X-API-Key header
 * Validation: validatePaginationParams
 * Note: Must come before /all route to avoid conflicts
 */
protectedMessageRoutes.get('/all/paginated', validatePaginationParams, getAllMessagesPaginated);

/**
 * GET /protected/message/all - Get all messages (protected)
 * Requires: X-API-Key header
 * Note: Must come before /:name route to avoid conflicts
 */
protectedMessageRoutes.get('/all', getAllMessages);

/**
 * GET /protected/message/paginated?priority=N - Get messages by priority with pagination (protected)
 * Requires: X-API-Key header
 * Validation: validatePriorityQuery, validatePaginationParams
 * Note: Must come before /:name route to avoid conflicts
 */
protectedMessageRoutes.get('/paginated', validatePriorityQuery, validatePaginationParams, getMessagesByPriorityPaginated);

/**
 * GET /protected/message/:name - Get message by name (protected)
 * Requires: X-API-Key header
 * Validation: validateNameParam
 * Note: Must come before query param route to avoid conflicts
 */
protectedMessageRoutes.get('/:name', validateNameParam, getMessageByName);

/**
 * DELETE /protected/message/:name - Delete message by name (protected)
 * Requires: X-API-Key header
 * Validation: validateNameParam
 * Note: Must come before query param route to avoid conflicts
 */
protectedMessageRoutes.delete('/:name', validateNameParam, deleteMessageByName);

/**
 * GET /protected/message?priority=N - Get messages by priority (protected)
 * Requires: X-API-Key header
 * Validation: validatePriorityQuery
 * Note: Must come after path param routes to avoid conflicts
 */
protectedMessageRoutes.get('/', validatePriorityQuery, getMessagesByPriority);

/**
 * DELETE /protected/message?priority=N - Delete messages by priority (protected)
 * Requires: X-API-Key header
 * Validation: validatePriorityQuery
 * Note: Must come after path param routes to avoid conflicts
 */
protectedMessageRoutes.delete('/', validatePriorityQuery, deleteMessagesByPriority);
