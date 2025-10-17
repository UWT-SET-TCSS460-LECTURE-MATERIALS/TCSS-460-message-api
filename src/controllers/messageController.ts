import { Request, Response } from 'express';
import { getPool } from '@utilities/database';
import { sendSuccess, sendError } from '@utilities/responseUtils';
import {
    MessageRequest,
    MessageObject,
    MessageEntry,
    MessageRecord,
    ErrorCodes,
    PagePaginationParams,
    OffsetPaginationParams,
    PagePaginationMeta,
    OffsetPaginationMeta,
    PaginatedMessageResponse
} from '@/types';

/**
 * Format a message object into the display string
 * Creates standardized message format: "{priority} - [name] says: message"
 *
 * @param messageObject - The message data to format
 * @returns Formatted message string
 * @example
 * formatMessage({name: "John", message: "Hello", priority: 1})
 * // Returns: "{1} - [John] says: Hello"
 */
const formatMessage = (messageObject: MessageObject): string => {
    return `{${messageObject.priority}} - [${messageObject.name}] says: ${messageObject.message}`;
};

/**
 * Create a new message entry in the database
 * Input validation handled by validateCreateMessage middleware
 * Checks for duplicate names and stores the message with auto-generated ID
 *
 * @param request - Express request object containing validated message data in body
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 400 error if name already exists in database
 * @throws Will send 500 error if database operation fails
 * @example
 * POST /message
 * Body: { name: "John Doe", message: "Hello World", priority: 1 }
 * Success Response: { success: true, data: { entry: "{1} - [John Doe] says: Hello World", messageId: 123 } }
 */
export const createMessage = async (request: Request, response: Response): Promise<void> => {
    try {
        const { name, message, priority }: MessageRequest = request.body;

        const pool = getPool();

        // Check if name already exists
        const existingUser = await pool.query('SELECT name FROM messages WHERE name = $1', [name]);
        if (existingUser.rows.length > 0) {
            sendError(response, 400, "Name already exists - please choose a different name", ErrorCodes.MSG_NAME_EXISTS);
            return;
        }

        // Insert new message
        const result = await pool.query(
            'INSERT INTO messages (name, message, priority) VALUES ($1, $2, $3) RETURNING *',
            [name, message, priority]
        );

        const messageObject: MessageObject = {
            name: result.rows[0].name,
            message: result.rows[0].message,
            priority: result.rows[0].priority
        };

        sendSuccess(
            response,
            {
                name: messageObject.name,
                message: messageObject.message,
                priority: messageObject.priority,
                formatted: formatMessage(messageObject)
            },
            "Message created successfully",
            201
        );

    } catch (error) {
        console.error('Error creating message:', error);
        sendError(response, 500, "Server error occurred while creating message - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Retrieve all messages with a specific priority level
 * Priority validation handled by validatePriorityQuery middleware
 * Fetches messages from database filtered by priority and ordered by creation date
 *
 * @param request - Express request object with validated priority query parameter (1-3)
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 404 error if no messages found with specified priority
 * @throws Will send 500 error if database operation fails
 * @example
 * GET /message?priority=1
 * Success Response: { success: true, data: { entries: [...], count: 2, priority: 1 } }
 */
export const getMessagesByPriority = async (request: Request, response: Response): Promise<void> => {
    try {
        const priority = parseInt(request.query.priority as string);

        const pool = getPool();
        const result = await pool.query(
            'SELECT name, message, priority FROM messages WHERE priority = $1 ORDER BY created_at ASC',
            [priority]
        );

        if (result.rows.length === 0) {
            sendError(response, 404, `No messages found with priority ${priority}`, ErrorCodes.MSG_NO_PRIORITY_FOUND);
            return;
        }

        const entries: MessageEntry[] = result.rows.map((row: MessageRecord) => ({
            name: row.name,
            message: row.message,
            priority: row.priority,
            formatted: formatMessage({
                name: row.name,
                message: row.message,
                priority: row.priority
            })
        }));

        sendSuccess(
            response,
            { entries, count: entries.length, priority },
            `Retrieved ${entries.length} message(s) with priority ${priority}`
        );

    } catch (error) {
        console.error('Error getting messages by priority:', error);
        sendError(response, 500, "Server error occurred while retrieving messages - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Update the message content for an existing name
 * Input validation handled by validateUpdateMessage middleware
 * Modifies only the message text, preserving name, priority, and creation date
 *
 * @param request - Express request object with validated name and message in body
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 404 error if no message exists with the specified name
 * @throws Will send 500 error if database operation fails
 * @example
 * PATCH /message
 * Body: { name: "John Doe", message: "Updated message content" }
 * Success Response: { success: true, data: { entry: "Updated: {1} - [John Doe] says: Updated message content" } }
 */
export const updateMessage = async (request: Request, response: Response): Promise<void> => {
    try {
        const { name, message } = request.body;

        const pool = getPool();

        // Check if name exists
        const existingMessage = await pool.query('SELECT * FROM messages WHERE name = $1', [name]);
        if (existingMessage.rows.length === 0) {
            sendError(response, 404, "Message not found - no message exists with the specified name", ErrorCodes.MSG_NOT_FOUND);
            return;
        }

        // Update the message
        const result = await pool.query(
            'UPDATE messages SET message = $2, updated_at = CURRENT_TIMESTAMP WHERE name = $1 RETURNING *',
            [name, message]
        );

        const messageObject: MessageObject = {
            name: result.rows[0].name,
            message: result.rows[0].message,
            priority: result.rows[0].priority
        };

        sendSuccess(
            response,
            {
                name: messageObject.name,
                message: messageObject.message,
                priority: messageObject.priority,
                formatted: formatMessage(messageObject)
            },
            "Message updated successfully"
        );

    } catch (error) {
        console.error('Error updating message:', error);
        sendError(response, 500, "Server error occurred while updating message - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Delete all messages with a specific priority level
 * Priority validation handled by validatePriorityQuery middleware
 * Removes all messages matching the priority from database and returns deleted entries
 *
 * @param request - Express request object with validated priority query parameter (1-3)
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 404 error if no messages found with specified priority
 * @throws Will send 500 error if database operation fails
 * @example
 * DELETE /message?priority=2
 * Success Response: { success: true, data: { entries: [...], deletedCount: 3, priority: 2 } }
 */
export const deleteMessagesByPriority = async (request: Request, response: Response): Promise<void> => {
    try {
        const priority = parseInt(request.query.priority as string);

        const pool = getPool();

        // Get messages before deleting
        const messagesToDelete = await pool.query(
            'SELECT name, message, priority FROM messages WHERE priority = $1 ORDER BY created_at ASC',
            [priority]
        );

        if (messagesToDelete.rows.length === 0) {
            sendError(response, 404, `No messages found with priority ${priority}`, ErrorCodes.MSG_NO_PRIORITY_FOUND);
            return;
        }

        // Delete the messages
        await pool.query('DELETE FROM messages WHERE priority = $1', [priority]);

        const deleted: MessageEntry[] = messagesToDelete.rows.map((row: MessageRecord) => ({
            name: row.name,
            message: row.message,
            priority: row.priority,
            formatted: formatMessage({
                name: row.name,
                message: row.message,
                priority: row.priority
            })
        }));

        sendSuccess(
            response,
            {
                deleted,
                deletedCount: deleted.length,
                priority
            },
            `Successfully deleted ${deleted.length} message(s) with priority ${priority}`
        );

    } catch (error) {
        console.error('Error deleting messages by priority:', error);
        sendError(response, 500, "Server error occurred while deleting messages - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Retrieve all messages from the database
 * Fetches complete message list ordered by priority (ascending) then creation date
 *
 * @param _request - Express request object (unused - no parameters required)
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 500 error if database operation fails
 * @example
 * GET /message/all
 * Success Response: {
 *   success: true,
 *   data: {
 *     entries: [...],
 *     totalCount: 5,
 *     priorityBreakdown: { priority1: 2, priority2: 1, priority3: 2 }
 *   }
 * }
 */
export const getAllMessages = async (_request: Request, response: Response): Promise<void> => {
    try {
        const pool = getPool();
        const result = await pool.query(
            'SELECT name, message, priority FROM messages ORDER BY priority ASC, created_at ASC'
        );

        const entries: MessageEntry[] = result.rows.map((row: MessageRecord) => ({
            name: row.name,
            message: row.message,
            priority: row.priority,
            formatted: formatMessage({
                name: row.name,
                message: row.message,
                priority: row.priority
            })
        }));

        sendSuccess(
            response,
            {
                entries,
                totalCount: entries.length,
                priorityBreakdown: {
                    priority1: entries.filter(e => e.priority === 1).length,
                    priority2: entries.filter(e => e.priority === 2).length,
                    priority3: entries.filter(e => e.priority === 3).length
                }
            },
            `Retrieved ${entries.length} total message(s)`
        );

    } catch (error) {
        console.error('Error getting all messages:', error);
        sendError(response, 500, "Server error occurred while retrieving all messages - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Retrieve a specific message by sender name
 * Fetches the complete message entry for the specified name
 *
 * @param request - Express request object with name path parameter
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 404 error if no message exists with the specified name
 * @throws Will send 500 error if database operation fails
 * @example
 * GET /message/John%20Doe
 * Success Response: { success: true, data: { entry: { name: "John Doe", message: "Hello", priority: 1 } } }
 */
export const getMessageByName = async (request: Request, response: Response): Promise<void> => {
    try {
        const { name } = request.params;

        const pool = getPool();
        const result = await pool.query(
            'SELECT name, message, priority FROM messages WHERE name = $1',
            [name]
        );

        if (result.rows.length === 0) {
            sendError(response, 404, "Message not found - no message exists with the specified name", ErrorCodes.MSG_NOT_FOUND);
            return;
        }

        const messageObject: MessageObject = {
            name: result.rows[0].name,
            message: result.rows[0].message,
            priority: result.rows[0].priority
        };

        sendSuccess(
            response,
            {
                name: messageObject.name,
                message: messageObject.message,
                priority: messageObject.priority,
                formatted: formatMessage(messageObject)
            },
            `Retrieved message for '${name}'`
        );

    } catch (error) {
        console.error('Error getting message by name:', error);
        sendError(response, 500, "Server error occurred while retrieving message - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Delete a specific message by sender name
 * Removes the message entry from database and returns the deleted message data
 *
 * @param request - Express request object with name path parameter
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 404 error if no message exists with the specified name
 * @throws Will send 500 error if database operation fails
 * @example
 * DELETE /message/John%20Doe
 * Success Response: { success: true, data: { entry: "Deleted: {1} - [John Doe] says: Hello", deletedMessage: {...} } }
 */
export const deleteMessageByName = async (request: Request, response: Response): Promise<void> => {
    try {
        const { name } = request.params;

        const pool = getPool();

        // Get message before deleting
        const messageToDelete = await pool.query(
            'SELECT name, message, priority FROM messages WHERE name = $1',
            [name]
        );

        if (messageToDelete.rows.length === 0) {
            sendError(response, 404, "Message not found - no message exists with the specified name", ErrorCodes.MSG_NOT_FOUND);
            return;
        }

        // Delete the message
        await pool.query('DELETE FROM messages WHERE name = $1', [name]);

        const deletedMessage = messageToDelete.rows[0];
        const deleted: MessageEntry = {
            name: deletedMessage.name,
            message: deletedMessage.message,
            priority: deletedMessage.priority,
            formatted: formatMessage({
                name: deletedMessage.name,
                message: deletedMessage.message,
                priority: deletedMessage.priority
            })
        };

        sendSuccess(
            response,
            { deleted },
            `Successfully deleted message for '${name}'`
        );

    } catch (error) {
        console.error('Error deleting message by name:', error);
        sendError(response, 500, "Server error occurred while deleting message - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Helper function: Retrieve paginated messages using page-based pagination
 * Executes SQL query with LIMIT and calculated OFFSET based on page number
 *
 * @param page - Page number (1-indexed)
 * @param limit - Maximum number of items per page
 * @param priorityFilter - Optional priority filter (1-3), undefined for all messages
 * @returns Promise resolving to paginated response with entries and metadata
 * @throws Will throw error if database operation fails
 * @example
 * // Get page 2 with 10 items per page
 * const result = await getMessagesWithPagePagination(2, 10);
 * // Returns items 11-20
 * @example
 * // Get page 1 of priority 1 messages
 * const result = await getMessagesWithPagePagination(1, 10, 1);
 */
const getMessagesWithPagePagination = async (
    page: number,
    limit: number,
    priorityFilter?: number
): Promise<PaginatedMessageResponse> => {
    const pool = getPool();

    // Calculate offset from page number (page 1 = offset 0, page 2 = offset 10, etc.)
    const offset = (page - 1) * limit;

    // Build query based on whether priority filter is provided
    const baseQuery = priorityFilter !== undefined
        ? 'SELECT name, message, priority FROM messages WHERE priority = $1'
        : 'SELECT name, message, priority FROM messages';

    const countQuery = priorityFilter !== undefined
        ? 'SELECT COUNT(*) FROM messages WHERE priority = $1'
        : 'SELECT COUNT(*) FROM messages';

    const orderAndPagination = ' ORDER BY created_at DESC LIMIT $' +
        (priorityFilter !== undefined ? '2' : '1') + ' OFFSET $' +
        (priorityFilter !== undefined ? '3' : '2');

    // Execute queries
    const queryParams = priorityFilter !== undefined
        ? [priorityFilter, limit, offset]
        : [limit, offset];

    const countParams = priorityFilter !== undefined ? [priorityFilter] : [];

    const [dataResult, countResult] = await Promise.all([
        pool.query(baseQuery + orderAndPagination, queryParams),
        pool.query(countQuery, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Transform database rows to MessageEntry format
    const entries: MessageEntry[] = dataResult.rows.map((row: MessageRecord) => ({
        name: row.name,
        message: row.message,
        priority: row.priority,
        formatted: formatMessage({
            name: row.name,
            message: row.message,
            priority: row.priority
        })
    }));

    // Build page-based pagination metadata
    const pagination: PagePaginationMeta = {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
    };

    return { entries, pagination };
};

/**
 * Helper function: Retrieve paginated messages using offset-based pagination
 * Executes SQL query with LIMIT and direct OFFSET value
 *
 * @param offset - Number of records to skip (0-indexed)
 * @param limit - Maximum number of items to return
 * @param priorityFilter - Optional priority filter (1-3), undefined for all messages
 * @returns Promise resolving to paginated response with entries and metadata
 * @throws Will throw error if database operation fails
 * @example
 * // Skip first 20 items, get next 10
 * const result = await getMessagesWithOffsetPagination(20, 10);
 * // Returns items 21-30
 * @example
 * // Get first 10 priority 2 messages
 * const result = await getMessagesWithOffsetPagination(0, 10, 2);
 */
const getMessagesWithOffsetPagination = async (
    offset: number,
    limit: number,
    priorityFilter?: number
): Promise<PaginatedMessageResponse> => {
    const pool = getPool();

    // Build query based on whether priority filter is provided
    const baseQuery = priorityFilter !== undefined
        ? 'SELECT name, message, priority FROM messages WHERE priority = $1'
        : 'SELECT name, message, priority FROM messages';

    const countQuery = priorityFilter !== undefined
        ? 'SELECT COUNT(*) FROM messages WHERE priority = $1'
        : 'SELECT COUNT(*) FROM messages';

    const orderAndPagination = ' ORDER BY created_at DESC LIMIT $' +
        (priorityFilter !== undefined ? '2' : '1') + ' OFFSET $' +
        (priorityFilter !== undefined ? '3' : '2');

    // Execute queries
    const queryParams = priorityFilter !== undefined
        ? [priorityFilter, limit, offset]
        : [limit, offset];

    const countParams = priorityFilter !== undefined ? [priorityFilter] : [];

    const [dataResult, countResult] = await Promise.all([
        pool.query(baseQuery + orderAndPagination, queryParams),
        pool.query(countQuery, countParams)
    ]);

    const totalCount = parseInt(countResult.rows[0].count);

    // Transform database rows to MessageEntry format
    const entries: MessageEntry[] = dataResult.rows.map((row: MessageRecord) => ({
        name: row.name,
        message: row.message,
        priority: row.priority,
        formatted: formatMessage({
            name: row.name,
            message: row.message,
            priority: row.priority
        })
    }));

    // Build offset-based pagination metadata
    const pagination: OffsetPaginationMeta = {
        offset,
        limit,
        totalCount,
        hasNext: offset + limit < totalCount,
        hasPrevious: offset > 0
    };

    return { entries, pagination };
};

/**
 * Get all messages with pagination support
 * Supports both page-based and offset-based pagination
 * Validation handled by validatePaginationParams middleware
 *
 * @param request - Express request with pagination query parameters
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 500 error if database operation fails
 * @example
 * GET /message/all/paginated?page=2&limit=10
 * Success Response: {
 *   success: true,
 *   data: {
 *     entries: [...],
 *     pagination: { page: 2, limit: 10, totalCount: 45, totalPages: 5, hasNext: true, hasPrevious: true }
 *   }
 * }
 * @example
 * GET /message/all/paginated?offset=20&limit=10
 * Success Response: {
 *   success: true,
 *   data: {
 *     entries: [...],
 *     pagination: { offset: 20, limit: 10, totalCount: 45, hasNext: true, hasPrevious: true }
 *   }
 * }
 */
export const getAllMessagesPaginated = async (request: Request, response: Response): Promise<void> => {
    try {
        const { page, offset, limit } = request.query;

        // Set defaults
        const limitValue = limit ? parseInt(limit as string) : 10;

        let result: PaginatedMessageResponse;
        let message: string;

        if (page !== undefined) {
            // Page-based pagination
            const pageValue = parseInt(page as string);
            result = await getMessagesWithPagePagination(pageValue, limitValue);
            message = `Retrieved page ${pageValue} of messages (${limitValue} per page)`;
        } else {
            // Offset-based pagination (offset defaults to 0 if not provided)
            const offsetValue = offset ? parseInt(offset as string) : 0;
            result = await getMessagesWithOffsetPagination(offsetValue, limitValue);
            message = `Retrieved ${result.entries.length} message(s) starting at offset ${offsetValue}`;
        }

        sendSuccess(response, result, message);

    } catch (error) {
        console.error('Error getting paginated messages:', error);
        sendError(response, 500, "Server error occurred while retrieving paginated messages - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};

/**
 * Get messages by priority with pagination support
 * Supports both page-based and offset-based pagination
 * Validation handled by validatePriorityQuery and validatePaginationParams middleware
 *
 * @param request - Express request with priority and pagination query parameters
 * @param response - Express response object for sending results
 * @returns Promise<void>
 * @throws Will send 404 error if no messages found with specified priority
 * @throws Will send 500 error if database operation fails
 * @example
 * GET /message/paginated?priority=1&page=2&limit=10
 * Success Response: {
 *   success: true,
 *   data: {
 *     entries: [...],
 *     pagination: { page: 2, limit: 10, totalCount: 25, totalPages: 3, hasNext: true, hasPrevious: true },
 *     priority: 1
 *   }
 * }
 */
export const getMessagesByPriorityPaginated = async (request: Request, response: Response): Promise<void> => {
    try {
        const { priority, page, offset, limit } = request.query;
        const priorityValue = parseInt(priority as string);

        // Set defaults
        const limitValue = limit ? parseInt(limit as string) : 10;

        let result: PaginatedMessageResponse;
        let message: string;

        if (page !== undefined) {
            // Page-based pagination
            const pageValue = parseInt(page as string);
            result = await getMessagesWithPagePagination(pageValue, limitValue, priorityValue);
            message = `Retrieved page ${pageValue} of priority ${priorityValue} messages (${limitValue} per page)`;
        } else {
            // Offset-based pagination (offset defaults to 0 if not provided)
            const offsetValue = offset ? parseInt(offset as string) : 0;
            result = await getMessagesWithOffsetPagination(offsetValue, limitValue, priorityValue);
            message = `Retrieved ${result.entries.length} priority ${priorityValue} message(s) starting at offset ${offsetValue}`;
        }

        // Check if any results found
        if (result.entries.length === 0 && (page === undefined || parseInt(page as string) === 1) && (offset === undefined || parseInt(offset as string) === 0)) {
            sendError(response, 404, `No messages found with priority ${priorityValue}`, ErrorCodes.MSG_NO_PRIORITY_FOUND);
            return;
        }

        sendSuccess(response, { ...result, priority: priorityValue }, message);

    } catch (error) {
        console.error('Error getting paginated messages by priority:', error);
        sendError(response, 500, "Server error occurred while retrieving paginated messages - please contact support", ErrorCodes.SRVR_INTERNAL_ERROR);
    }
};