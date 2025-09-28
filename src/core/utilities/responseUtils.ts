/**
 * API RESPONSE UTILITIES - EDUCATIONAL OVERVIEW
 *
 * What are Response Utilities?
 * ===========================
 * Response utilities provide a consistent way to format all API responses across your application.
 * Instead of manually constructing JSON responses in every controller, these utilities ensure
 * every response follows the same structure and format.
 *
 * Why Consistent Response Format Matters:
 * ======================================
 * ✅ Frontend developers know exactly what to expect from every endpoint
 * ✅ Error handling becomes predictable and reliable
 * ✅ API documentation is cleaner and more professional
 * ✅ Debugging is easier when all responses follow the same pattern
 * ✅ Automated testing can rely on consistent response structure
 *
 * Standard API Response Pattern:
 * =============================
 * Every response includes:
 * - success: boolean (true for 2xx status codes, false for 4xx/5xx)
 * - message: optional human-readable description
 * - data: optional payload (varies by endpoint)
 * - errorCode: optional machine-readable error identifier
 * - errors: optional detailed validation errors
 *
 * HTTP Status Codes (Important for Web APIs):
 * ===========================================
 * 200 OK - Request succeeded, data returned
 * 201 Created - Resource successfully created
 * 400 Bad Request - Client sent invalid data
 * 404 Not Found - Requested resource doesn't exist
 * 500 Internal Server Error - Server-side problem
 *
 * Example Success Response:
 * ========================
 * {
 * "success": true,
 *   "message": "Message created successfully",
 *   "data": {
 *     "id": 123,
 *     "entry": "{1} - [John] says: Hello World"
 *   }
 * }
 *
 * Example Error Response:
 * ======================
 * {
 *   "success": false,
 *   "message": "Name already exists - please choose a different name",
 *   "errorCode": "MSG_NAME_EXISTS"
 * }
 *
 * Frontend Integration Benefits:
 * =============================
 * With consistent responses, frontend code becomes simpler:
 *
 * ```javascript
 * const response = await fetch('/api/message', { method: 'POST', ... });
 * const result = await response.json();
 *
 * if (result.success) {
 *   // Handle success - data is in result.data
 *   console.log('Success:', result.message);
 *   updateUI(result.data);
 * } else {
 *   // Handle error - message explains what went wrong
 *   showError(result.message);
 * }
 * ```
 *
 * The utilities below implement this pattern consistently across all endpoints.
 */

import { Response } from 'express';

/**
 * Standard API response structure used across all endpoints
 * Provides consistent format for both success and error responses
 * Generic type T allows for type-safe data payloads
 *
 * @interface ApiResponse<T>
 * @template T The type of data returned in successful responses
 * @example
 * // Success response with message data
 * const response: ApiResponse<MessageEntry> = {
 *   success: true,
 *   message: "Message retrieved successfully",
 *   data: { name: "John", message: "Hello", priority: 1, formatted: "..." }
 * };
 * @example
 * // Error response with validation details
 * const response: ApiResponse = {
 *   success: false,
 *   message: "Validation failed",
 *   errorCode: "VALIDATION_ERROR",
 *   errors: [{ field: "name", message: "Name is required" }]
 * };
 */
export interface ApiResponse<T = any> {
    /** Indicates whether the request was successful (true) or failed (false) */
    success: boolean;
    /** Optional human-readable message providing context about the response */
    message?: string;
    /** Optional data payload for successful responses (type varies by endpoint) */
    data?: T;
    /** Optional machine-readable error code for programmatic error handling */
    errorCode?: string;
    /** Optional array of detailed error information (typically validation errors) */
    errors?: any[];
}

/**
 * Send standardized success response with optional data and message
 * Creates consistent response structure across all API endpoints
 * Uses HTTP status codes to indicate the type of success (200 OK, 201 Created, etc.)
 *
 * @param response - Express response object for sending HTTP response
 * @param data - Optional data payload to include in response (type T)
 * @param message - Optional success message for context
 * @param statusCode - HTTP status code (defaults to 200 OK)
 * @returns void
 * @example
 * // Simple success response
 * sendSuccess(response);
 * // Response: { "success": true }
 * @example
 * // Success with message only
 * sendSuccess(response, undefined, "Operation completed successfully");
 * // Response: { "success": true, "message": "Operation completed successfully" }
 * @example
 * // Success with data and message (typical controller usage)
 * sendSuccess(
 *   response,
 *   { entries: [...], count: 5 },
 *   "Retrieved 5 messages successfully"
 * );
 * // Response: {
 * //   "success": true,
 * //   "message": "Retrieved 5 messages successfully",
 * //   "data": { "entries": [...], "count": 5 }
 * // }
 * @example
 * // Created resource (201 status)
 * sendSuccess(
 *   response,
 *   { messageId: 123, entry: "New message" },
 *   "Message created successfully",
 *   201
 * );
 */
export const sendSuccess = <T>(
    response: Response,
    data?: T,
    message?: string,
    statusCode: number = 200
): void => {
    const responseBody: ApiResponse<T> = {
        success: true,
        ...(message && { message }),
        ...(data !== undefined && { data })
    };

    response.status(statusCode).json(responseBody);
};

/**
 * Send standardized error response with message and optional error details
 * Creates consistent error format across all API endpoints with proper HTTP status codes
 * Supports both human-readable messages and machine-readable error codes
 *
 * @param response - Express response object for sending HTTP response
 * @param statusCode - HTTP error status code (400, 404, 500, etc.)
 * @param message - Human-readable error message explaining what went wrong
 * @param errorCode - Optional machine-readable error code for programmatic handling
 * @param errors - Optional detailed error information (e.g., validation field errors)
 * @returns void
 * @example
 * // Simple error response
 * sendError(response, 404, "Message not found");
 * // Response: { "success": false, "message": "Message not found" }
 * @example
 * // Error with machine-readable code (recommended for business logic errors)
 * sendError(
 *   response,
 *   400,
 *   "Name already exists - please choose a different name",
 *   ErrorCodes.MSG_NAME_EXISTS
 * );
 * // Response: {
 * //   "success": false,
 * //   "message": "Name already exists - please choose a different name",
 * //   "errorCode": "MSG_NAME_EXISTS"
 * // }
 * @example
 * // Detailed validation errors
 * sendError(
 *   response,
 *   400,
 *   "Validation failed",
 *   "VALIDATION_ERROR",
 *   [
 *     { field: "name", message: "Name is required" },
 *     { field: "priority", message: "Priority must be between 1 and 3" }
 *   ]
 * );
 */
export const sendError = (
    response: Response,
    statusCode: number,
    message: string,
    errorCode?: string,
    errors?: any[]
): void => {
    const responseBody: ApiResponse = {
        success: false,
        message,
        ...(errorCode && { errorCode }),
        ...(errors && { errors })
    };

    response.status(statusCode).json(responseBody);
};

/**
 * Send standardized validation error response with field-specific error details
 * Convenience function for validation failures from express-validator middleware
 * Always uses 400 Bad Request status and VALIDATION_ERROR code for consistency
 *
 * @param response - Express response object for sending HTTP response
 * @param message - Human-readable validation error message (defaults to "Validation failed")
 * @param errors - Optional array of field-specific validation errors from express-validator
 * @returns void
 * @example
 * // Basic validation error
 * sendValidationError(response);
 * // Response: {
 * //   "success": false,
 * //   "message": "Validation failed",
 * //   "errorCode": "VALIDATION_ERROR"
 * // }
 * @example
 * // Custom validation message
 * sendValidationError(
 *   response,
 *   "Missing required information - please provide all required fields"
 * );
 * @example
 * // Validation with field-specific errors (typical middleware usage)
 * const errors = validationResult(request);
 * if (!errors.isEmpty()) {
 *   sendValidationError(
 *     response,
 *     "Priority must be between 1 and 3",
 *     errors.array()
 *   );
 *   return;
 * }
 * // Response: {
 * //   "success": false,
 * //   "message": "Priority must be between 1 and 3",
 * //   "errorCode": "VALIDATION_ERROR",
 * //   "errors": [
 * //     { "field": "priority", "message": "Priority must be an integer between 1 and 3" }
 * //   ]
 * // }
 */
export const sendValidationError = (
    response: Response,
    message: string = 'Validation failed',
    errors?: any[]
): void => {
    sendError(response, 400, message, 'VALIDATION_ERROR', errors);
};