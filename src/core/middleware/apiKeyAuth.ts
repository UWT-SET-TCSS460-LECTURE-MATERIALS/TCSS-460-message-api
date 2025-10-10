/**
 * API Key Authentication Middleware
 *
 * Validates API keys from request headers and authenticates requests to protected endpoints.
 * Implements stateful authentication by checking keys against the database and tracking usage.
 *
 * Educational Focus:
 * - Demonstrates stateful authentication (database lookup on every request)
 * - Shows request tracking and usage metrics
 * - Illustrates middleware authentication patterns in Express
 * - Compare with stateless JWT authentication
 *
 * @see {@link ../../docs-2.0/authentication-guide.md} for auth pattern comparisons (planned)
 */

import { Request, Response, NextFunction } from 'express';
import { getPool } from '@utilities/database';
import { sendError } from '@utilities/responseUtils';
import { isValidApiKeyFormat } from '@utilities/apiKeyUtils';
import { ErrorCodes, ApiKeyRecord, AuthenticatedRequest } from '@/types';

/**
 * Authenticate request using API key from X-API-Key header
 *
 * Validates the API key, checks if it's active, and tracks usage metrics.
 * Attaches key information to the request object for use in controllers.
 *
 * Educational Notes:
 * - This is stateful authentication (requires database lookup)
 * - Every request queries the database (compare with JWT)
 * - Tracks usage: last_used_at and request_count
 * - Easy to revoke keys (just set is_active = false)
 *
 * Header Format:
 * X-API-Key: 550e8400-e29b-41d4-a716-446655440000
 *
 * @param request - Express request object
 * @param response - Express response object
 * @param next - Express next function
 * @returns Promise<void>
 * @example
 * // Apply to protected routes
 * router.get('/protected/endpoint', apiKeyAuth, controller);
 * @example
 * // Access key info in controller
 * const authenticatedReq = request as AuthenticatedRequest;
 * console.log(`Request from: ${authenticatedReq.apiKey?.name}`);
 */
export const apiKeyAuth = async (
    request: Request,
    response: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // Extract API key from header
        const apiKey = request.headers['x-api-key'] as string | undefined;

        // Check if API key is provided
        if (!apiKey) {
            sendError(
                response,
                401,
                'API key required - visit /api-key to generate one',
                ErrorCodes.AUTH_KEY_REQUIRED
            );
            return;
        }

        // Validate API key format (quick check before database lookup)
        if (!isValidApiKeyFormat(apiKey)) {
            sendError(
                response,
                401,
                'Invalid API key format - please check your key or generate a new one at /api-key',
                ErrorCodes.AUTH_KEY_INVALID
            );
            return;
        }

        // Look up API key in database
        const pool = getPool();
        const result = await pool.query<ApiKeyRecord>(
            'SELECT id, api_key, name, email, is_active FROM api_keys WHERE api_key = $1',
            [apiKey]
        );

        // Check if key exists
        if (result.rows.length === 0) {
            sendError(
                response,
                401,
                'Invalid API key - please check your key or generate a new one at /api-key',
                ErrorCodes.AUTH_KEY_INVALID
            );
            return;
        }

        const keyRecord = result.rows[0];

        // Check if key is active
        if (!keyRecord.is_active) {
            sendError(
                response,
                401,
                'API key has been revoked - please generate a new one at /api-key',
                ErrorCodes.AUTH_KEY_REVOKED
            );
            return;
        }

        // Update usage tracking (last_used_at and request_count)
        // Educational: This shows how to track API usage for analytics/rate limiting
        await pool.query(
            `UPDATE api_keys
             SET last_used_at = CURRENT_TIMESTAMP,
                 request_count = request_count + 1
             WHERE id = $1`,
            [keyRecord.id]
        );

        // Attach key info to request for use in controllers
        const authenticatedReq = request as AuthenticatedRequest;
        authenticatedReq.apiKey = {
            id: keyRecord.id,
            name: keyRecord.name,
            email: keyRecord.email
        };

        // Authentication successful - proceed to next middleware/controller
        next();

    } catch (error) {
        console.error('API key authentication error:', error);
        sendError(
            response,
            500,
            'Authentication error - please try again',
            ErrorCodes.SRVR_INTERNAL_ERROR
        );
    }
};
