import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { sendValidationError } from '@utilities/responseUtils';

/**
 * Middleware to handle validation results
 *
 * @param request - Express request object containing validation data
 * @param response - Express response object for sending validation errors
 * @param next - Express next function to continue middleware chain
 */
export const handleValidationErrors = (
    request: Request,
    response: Response,
    next: NextFunction
): void => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
        sendValidationError(response, 'Validation failed', errors.array());
        return;
    }

    next();
};

/**
 * Example validation chain for basic resource creation
 */
export const validateResourceCreation = [
    body('name')
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must be less than 500 characters'),

    handleValidationErrors
];