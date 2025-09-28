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