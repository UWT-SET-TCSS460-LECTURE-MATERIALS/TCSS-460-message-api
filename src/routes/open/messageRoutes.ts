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

export const messageRoutes = Router();

// POST /message - Create a new message entry
messageRoutes.post('/', validateCreateMessage, createMessage);

// GET /message?priority=N - Get messages by priority
messageRoutes.get('/', validatePriorityQuery, getMessagesByPriority);

// PATCH /message - Update an existing message
messageRoutes.patch('/', validateUpdateMessage, updateMessage);

// DELETE /message?priority=N - Delete messages by priority
messageRoutes.delete('/', validatePriorityQuery, deleteMessagesByPriority);

// GET /message/all - Get all messages
messageRoutes.get('/all', getAllMessages);

// GET /message/:name - Get message by name
messageRoutes.get('/:name', validateNameParam, getMessageByName);

// DELETE /message/:name - Delete message by name
messageRoutes.delete('/:name', validateNameParam, deleteMessageByName);