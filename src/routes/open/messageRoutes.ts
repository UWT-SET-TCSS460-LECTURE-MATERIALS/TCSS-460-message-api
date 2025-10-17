import { Router } from 'express';
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

export const messageRoutes = Router();

// POST /message - Create a new message entry
messageRoutes.post('/', validateCreateMessage, createMessage);

// PATCH /message - Update an existing message
messageRoutes.patch('/', validateUpdateMessage, updateMessage);

// GET /message/all/paginated - Get all messages with pagination (must come before /all)
messageRoutes.get('/all/paginated', validatePaginationParams, getAllMessagesPaginated);

// GET /message/all - Get all messages (must come before /:name)
messageRoutes.get('/all', getAllMessages);

// GET /message/paginated?priority=N - Get messages by priority with pagination (must come before /:name)
messageRoutes.get('/paginated', validatePriorityQuery, validatePaginationParams, getMessagesByPriorityPaginated);

// GET /message/:name - Get message by name (must come before query param route)
messageRoutes.get('/:name', validateNameParam, getMessageByName);

// DELETE /message/:name - Delete message by name (must come before query param route)
messageRoutes.delete('/:name', validateNameParam, deleteMessageByName);

// GET /message?priority=N - Get messages by priority (must come after path param routes)
messageRoutes.get('/', validatePriorityQuery, getMessagesByPriority);

// DELETE /message?priority=N - Delete messages by priority (must come after path param routes)
messageRoutes.delete('/', validatePriorityQuery, deleteMessagesByPriority);