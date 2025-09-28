/**
 * API response and utility type definitions for the TCSS-460 Message API
 *
 * Defines standardized response structures, transaction utilities, and error handling
 * types used across all API endpoints. Ensures consistent response formatting and
 * type-safe error handling throughout the application.
 *
 * @see {@link ../../docs/api-design-patterns.md#response-formatting} for response patterns
 * @see {@link ../../docs/database-fundamentals.md#database-transactions} for transaction concepts
 */

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
 * Result wrapper for database transaction operations
 * Provides consistent success/failure handling with optional data payload and error information
 * Generic type T allows for type-safe data return from transaction operations
 *
 * @interface TransactionResult<T>
 * @template T The type of data returned on successful transaction completion
 * @example
 * // Successful transaction result
 * const result: TransactionResult<MessageRecord> = {
 *   success: true,
 *   data: { id: 123, name: "John", message: "Hello", priority: 1, ... }
 * };
 * @example
 * // Failed transaction result
 * const result: TransactionResult<MessageRecord> = {
 *   success: false,
 *   error: new Error("Constraint violation: duplicate key")
 * };
 * @example
 * // Usage in transaction utility functions
 * const result = await withTransaction(async (client) => {
 *   return await client.query('INSERT INTO messages...');
 * });
 * if (result.success) {
 *   console.log('Transaction completed:', result.data);
 * } else {
 *   console.error('Transaction failed:', result.error);
 * }
 */
export interface TransactionResult<T> {
    /** Indicates whether the transaction completed successfully */
    success: boolean;
    /** Optional data payload returned from successful transaction (type T) */
    data?: T;
    /** Optional error information if transaction failed */
    error?: Error;
}