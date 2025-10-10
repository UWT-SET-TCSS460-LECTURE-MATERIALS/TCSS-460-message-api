/**
 * API Key validation middleware
 *
 * Provides input validation for API key generation endpoints using express-validator.
 * Ensures data integrity before processing key generation requests.
 *
 * Educational Focus:
 * - Demonstrates validation patterns for authentication endpoints
 * - Shows how to validate optional fields properly
 * - Follows project validation middleware patterns
 */

import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { sendValidationError } from '@utilities/responseUtils';

/**
 * Validates API key generation request
 *
 * Validates the request body for POST /api-key endpoint.
 * - name: required, trimmed, 1-255 characters
 * - email: required, valid email format
 *
 * @param request - Express request object with body
 * @param response - Express response object
 * @param next - Express next function
 * @example
 * // Valid requests:
 * { name: "John Doe", email: "john@example.com" }
 *
 * // Invalid requests:
 * { name: "" } // name required
 * { name: "John" } // email required
 * { name: "John", email: "invalid-email" } // invalid email format
 */
export const validateGenerateApiKey = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 1, max: 255 })
        .withMessage('Name must be between 1 and 255 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Email must be a valid email address')
        .normalizeEmail(),

    (request: Request, response: Response, next: NextFunction): void => {
        const errors = validationResult(request);
        if (!errors.isEmpty()) {
            sendValidationError(
                response,
                'API key generation validation failed',
                errors.array()
            );
            return;
        }
        next();
    }
];
