/**
 * Error code and error handling type definitions for the TCSS-460 Message API
 *
 * Provides standardized error codes and error handling patterns for consistent
 * error responses across all API endpoints. Enables type-safe error handling
 * and clear error messaging for both debugging and user experience.
 *
 * @see {@link ../../docs/api-design-patterns.md#error-handling} for error handling patterns
 * @see {@link ../../docs/web-security-guide.md#input-validation} for security error handling
 */

/**
 * Standardized error codes for the Message API
 * Provides machine-readable error identifiers for programmatic error handling
 * Organized by category for clear understanding and maintenance
 */
export const ErrorCodes = {
    // Validation Errors
    VALD_MISSING_FIELDS: 'VALD_MISSING_FIELDS',
    VALD_INVALID_EMAIL: 'VALD_INVALID_EMAIL',
    VALD_INVALID_PHONE: 'VALD_INVALID_PHONE',
    VALD_INVALID_FORMAT: 'VALD_INVALID_FORMAT',
    VALD_INVALID_PRIORITY: 'VALD_INVALID_PRIORITY',
    VALD_NAME_EXISTS: 'VALD_NAME_EXISTS',

    // Message-specific Validation Errors
    MSG_NAME_EXISTS: 'MSG_NAME_EXISTS',
    MSG_PRIORITY_INVALID: 'MSG_PRIORITY_INVALID',
    MSG_MALFORMED_JSON: 'MSG_MALFORMED_JSON',
    MSG_MISSING_REQUIRED_INFO: 'MSG_MISSING_REQUIRED_INFO',

    // Database Errors
    SRVR_DATABASE_ERROR: 'SRVR_DATABASE_ERROR',
    SRVR_TRANSACTION_FAILED: 'SRVR_TRANSACTION_FAILED',

    // Resource Errors
    RSRC_NOT_FOUND: 'RSRC_NOT_FOUND',
    RSRC_ALREADY_EXISTS: 'RSRC_ALREADY_EXISTS',
    RSRC_ACCESS_DENIED: 'RSRC_ACCESS_DENIED',
    RSRC_NAME_NOT_FOUND: 'RSRC_NAME_NOT_FOUND',

    // Message-specific Resource Errors
    MSG_NOT_FOUND: 'MSG_NOT_FOUND',
    MSG_NO_PRIORITY_FOUND: 'MSG_NO_PRIORITY_FOUND',

    // General Server Errors
    SRVR_INTERNAL_ERROR: 'SRVR_INTERNAL_ERROR',
    SRVR_SERVICE_UNAVAILABLE: 'SRVR_SERVICE_UNAVAILABLE'
} as const;

/**
 * Type-safe error code type derived from ErrorCodes object
 * Ensures only valid error codes can be used throughout the application
 *
 * @example
 * // Type-safe error code usage
 * const handleError = (code: ErrorCode) => {
 *   // TypeScript ensures only valid codes can be passed
 *   switch (code) {
 *     case ErrorCodes.MSG_NAME_EXISTS:
 *       return "Name already exists";
 *     case ErrorCodes.VALIDATION_ERROR:
 *       return "Validation failed";
 *     // ... other cases
 *   }
 * };
 */
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];