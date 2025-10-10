/**
 * API Key authentication type definitions for the TCSS-460 Message API
 *
 * Defines data structures for API key-based authentication including request payloads,
 * database records, and middleware request extensions. Provides type safety for the
 * stateful authentication system used to protect API endpoints.
 *
 * @see {@link ../../docs-2.0/authentication-guide.md} for authentication concepts (planned)
 * @see {@link ../../docs/typescript-patterns.md#interface-design} for type design patterns
 */

/**
 * Request payload for generating a new API key
 * Used by POST /api-key endpoint validation and processing
 * Both name and email are required for key identification
 *
 * @interface ApiKeyRequest
 * @example
 * const keyRequest: ApiKeyRequest = {
 *   name: "John Doe",
 *   email: "john@example.com"
 * };
 * @example
 * // Used in controller request body
 * export const generateApiKey = async (request: Request, response: Response) => {
 *   const { name, email }: ApiKeyRequest = request.body;
 *   // Generate and store new key...
 * };
 */
export interface ApiKeyRequest {
    /** Name of the person or service requesting the API key (required) */
    name: string;
    /** Email address for contact/notification purposes (required) */
    email: string;
}

/**
 * Database record structure for api_keys table rows
 * Represents the complete database row with all metadata fields
 * Used for database operations and tracking API key usage
 *
 * @interface ApiKeyRecord
 * @example
 * // Returned from database query
 * const keyRecord: ApiKeyRecord = {
 *   id: 1,
 *   api_key: "abc123def456789...",
 *   name: "John Doe",
 *   email: "john@example.com",
 *   is_active: true,
 *   created_at: new Date('2024-01-15T10:30:00Z'),
 *   last_used_at: new Date('2024-01-15T12:45:00Z'),
 *   request_count: 42
 * };
 * @example
 * // Used in authentication middleware
 * const result = await pool.query('SELECT * FROM api_keys WHERE api_key = $1', [key]);
 * const record: ApiKeyRecord = result.rows[0];
 */
export interface ApiKeyRecord {
    /** Auto-generated unique database identifier */
    id: number;
    /** The actual API key string (UUID v4 format, 36 characters) */
    api_key: string;
    /** Name of the key owner/service */
    name: string;
    /** Optional email for the key owner */
    email: string | null;
    /** Whether the key is currently active (used for revocation) */
    is_active: boolean;
    /** Timestamp when the key was created */
    created_at: Date;
    /** Timestamp when the key was last used for authentication (nullable) */
    last_used_at: Date | null;
    /** Total number of requests made with this key (educational metric) */
    request_count: number;
}

/**
 * Lightweight API key information attached to authenticated requests
 * Used by authentication middleware to attach key metadata to Express request object
 * Does not include sensitive fields or full database record
 *
 * @interface ApiKeyInfo
 * @example
 * // Attached to request by apiKeyAuth middleware
 * request.apiKey = {
 *   id: 1,
 *   name: "John Doe",
 *   email: "john@example.com"
 * };
 * @example
 * // Accessed in protected route controller
 * export const protectedController = (request: Request, response: Response) => {
 *   const keyOwner = request.apiKey?.name;
 *   // Use key info for logging or response customization
 * };
 */
export interface ApiKeyInfo {
    /** Database ID of the API key record */
    id: number;
    /** Name of the key owner */
    name: string;
    /** Email of the key owner (if provided) */
    email: string | null;
}

/**
 * Response format for successful API key generation
 * Returned by POST /api-key endpoint after creating a new key
 * Includes instructions for using the key
 *
 * @interface ApiKeyResponse
 * @example
 * // Response from POST /api-key
 * {
 *   success: true,
 *   data: {
 *     api_key: "abc123def456789...",
 *     name: "John Doe",
 *     created_at: "2024-01-15T10:30:00.000Z",
 *     usage: "Include this key in the X-API-Key header for protected endpoints"
 *   },
 *   message: "API key generated successfully"
 * }
 */
export interface ApiKeyResponse {
    /** The generated API key (only shown once during generation) */
    api_key: string;
    /** Name associated with the key */
    name: string;
    /** ISO timestamp when the key was created */
    created_at: string;
    /** Usage instructions for the client */
    usage: string;
}

/**
 * Extended Express Request type with API key information
 * Used in protected route handlers to access authenticated key metadata
 * Middleware attaches apiKey property after successful validation
 *
 * @interface AuthenticatedRequest
 * @example
 * import { Request, Response } from 'express';
 *
 * export const protectedHandler = (req: Request, res: Response) => {
 *   const request = req as AuthenticatedRequest;
 *   console.log(`Request from: ${request.apiKey.name}`);
 * };
 */
export interface AuthenticatedRequest {
    /** API key information attached by authentication middleware (undefined if not authenticated) */
    apiKey?: ApiKeyInfo;
}
