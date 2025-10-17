import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { sendValidationError } from '@utilities/responseUtils';

/**
 * Message-specific validation error handler with contextual messages
 *
 * @param request - Express request object containing message data
 * @param response - Express response object for sending validation errors
 * @param next - Express next function to continue middleware chain
 */
export const handleMessageValidationErrors = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        sendValidationError(response, "Missing required information - please provide all required fields", errors.array());
        return;
    }

    next();
};

/**
 * Validation chain for creating a new message
 * POST /message
 */
export const validateCreateMessage = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .trim(),

    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isString()
        .withMessage('Message must be a string')
        .trim(),

    body('priority')
        .isInt({ min: 1, max: 3 })
        .withMessage('Priority must be an integer between 1 and 3'),

    handleMessageValidationErrors
];

/**
 * Validation chain for updating a message
 * PATCH /message
 */
export const validateUpdateMessage = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .trim(),

    body('message')
        .notEmpty()
        .withMessage('Message is required')
        .isString()
        .withMessage('Message must be a string')
        .trim(),

    handleMessageValidationErrors
];

/**
 * Middleware to handle priority validation results with specific error message
 *
 * @param request - Express request object containing priority parameter
 * @param response - Express response object for sending validation errors
 * @param next - Express next function to continue middleware chain
 */
export const handlePriorityValidationErrors = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        sendValidationError(response, "Priority must be between 1 and 3", errors.array());
        return;
    }

    next();
};

/**
 * Validation chain for priority query parameter
 * GET/DELETE /message?priority=N
 */
export const validatePriorityQuery = [
    query('priority')
        .isInt({ min: 1, max: 3 })
        .withMessage('Priority must be an integer between 1 and 3'),

    handlePriorityValidationErrors
];

/**
 * Validation chain for name path parameter
 * GET/DELETE /message/:name
 */
export const validateNameParam = [
    param('name')
        .notEmpty()
        .withMessage('Name parameter is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters')
        .trim(),

    handleMessageValidationErrors
];

/**
 * Custom middleware to validate pagination parameters
 * Ensures only ONE pagination method is used (page OR offset, not both)
 * Also validates that pagination parameters are within acceptable ranges
 *
 * @param request - Express request object containing pagination query parameters
 * @param response - Express response object for sending validation errors
 * @param next - Express next function to continue middleware chain
 *
 * @example
 * // Valid: page-based pagination
 * GET /message/all/paginated?page=2&limit=10
 *
 * @example
 * // Valid: offset-based pagination
 * GET /message/all/paginated?offset=20&limit=10
 *
 * @example
 * // Invalid: both pagination types
 * GET /message/all/paginated?page=2&offset=20&limit=10
 * // Returns 400 error: "Cannot use both page and offset parameters"
 */
export const validatePaginationParams = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const { page, offset, limit } = request.query;

    // Check if both pagination methods are used
    if (page !== undefined && offset !== undefined) {
        sendValidationError(
            response,
            'Cannot use both page and offset parameters - choose one pagination method',
            [{
                type: 'field',
                msg: 'Cannot use both page and offset parameters - choose one pagination method',
                path: 'page,offset',
                location: 'query'
            }]
        );
        return;
    }

    // Validate page parameter if present
    if (page !== undefined) {
        const pageNum = Number(page);
        if (isNaN(pageNum) || pageNum < 1) {
            sendValidationError(
                response,
                'Page must be a positive integer (1 or greater)',
                [{
                    type: 'field',
                    msg: 'Page must be a positive integer',
                    path: 'page',
                    location: 'query',
                    value: page
                }]
            );
            return;
        }
    }

    // Validate offset parameter if present
    if (offset !== undefined) {
        const offsetNum = Number(offset);
        if (isNaN(offsetNum) || offsetNum < 0) {
            sendValidationError(
                response,
                'Offset must be a non-negative integer (0 or greater)',
                [{
                    type: 'field',
                    msg: 'Offset must be a non-negative integer',
                    path: 'offset',
                    location: 'query',
                    value: offset
                }]
            );
            return;
        }
    }

    // Validate limit parameter if present
    if (limit !== undefined) {
        const limitNum = Number(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            sendValidationError(
                response,
                'Limit must be an integer between 1 and 100',
                [{
                    type: 'field',
                    msg: 'Limit must be between 1 and 100',
                    path: 'limit',
                    location: 'query',
                    value: limit
                }]
            );
            return;
        }
    }

    next();
};