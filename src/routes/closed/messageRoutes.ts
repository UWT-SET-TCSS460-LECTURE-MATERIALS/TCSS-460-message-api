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

import { Router } from 'express';
import {
    createMessage,
    getMessagesByPriority,
    updateMessage,
    deleteMessagesByPriority,
    getAllMessages,
    getMessageByName,
    deleteMessageByName
} from '@controllers/messageController';
import {
    validateCreateMessage,
    validateUpdateMessage,
    validatePriorityQuery,
    validateNameParam
} from '@middleware/messageValidation';
import { apiKeyAuth } from '@middleware/apiKeyAuth';

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
 * GET /protected/message?priority=N - Get messages by priority (protected)
 * Requires: X-API-Key header
 * Validation: validatePriorityQuery
 */
protectedMessageRoutes.get('/', validatePriorityQuery, getMessagesByPriority);

/**
 * PATCH /protected/message - Update an existing message (protected)
 * Requires: X-API-Key header
 * Validation: validateUpdateMessage
 */
protectedMessageRoutes.patch('/', validateUpdateMessage, updateMessage);

/**
 * DELETE /protected/message?priority=N - Delete messages by priority (protected)
 * Requires: X-API-Key header
 * Validation: validatePriorityQuery
 */
protectedMessageRoutes.delete('/', validatePriorityQuery, deleteMessagesByPriority);

/**
 * GET /protected/message/all - Get all messages (protected)
 * Requires: X-API-Key header
 */
protectedMessageRoutes.get('/all', getAllMessages);

/**
 * GET /protected/message/:name - Get message by name (protected)
 * Requires: X-API-Key header
 * Validation: validateNameParam
 */
protectedMessageRoutes.get('/:name', validateNameParam, getMessageByName);

/**
 * DELETE /protected/message/:name - Delete message by name (protected)
 * Requires: X-API-Key header
 * Validation: validateNameParam
 */
protectedMessageRoutes.delete('/:name', validateNameParam, deleteMessageByName);
