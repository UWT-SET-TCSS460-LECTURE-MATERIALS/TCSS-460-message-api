/**
 * API Key Routes
 *
 * Public routes for API key generation and management.
 * Provides endpoints for users to generate new API keys for authentication.
 *
 * Routes:
 * - GET  /api-key - Serve HTML form for key generation
 * - POST /api-key - Generate new API key
 *
 * Educational Focus:
 * - Demonstrates API key generation workflow
 * - Shows how to serve both HTML and JSON from same route prefix
 * - Illustrates validation middleware pattern for auth endpoints
 */

import { Router } from 'express';
import { generateApiKeyController, serveApiKeyForm } from '@controllers';
import { validateGenerateApiKey } from '@middleware';

export const apiKeyRoutes = Router();

/**
 * GET /api-key
 * Serve the API key generation HTML form
 *
 * No authentication required - this is a public endpoint
 * Returns HTML page with form for name and email input
 */
apiKeyRoutes.get('/', serveApiKeyForm);

/**
 * POST /api-key
 * Generate a new API key
 *
 * Request Body:
 * - name: string (required) - Name of person/service
 * - email: string (optional) - Contact email
 *
 * Validation: validateGenerateApiKey middleware
 * - Ensures name is 1-255 characters
 * - Validates email format if provided
 *
 * Response:
 * - 201: API key generated successfully with usage instructions
 * - 400: Validation failed
 * - 500: Server error
 */
apiKeyRoutes.post('/', validateGenerateApiKey, generateApiKeyController);
