/**
 * Centralized type definitions for the TCSS-460 Message API
 *
 * Barrel export file providing clean imports for all type definitions used throughout
 * the application. Organizes types by domain (messages, API responses, errors) while
 * maintaining a single import point for consumers.
 *
 * @see {@link ../../docs/typescript-patterns.md#type-organization} for type organization patterns
 * @example
 * // Clean imports from centralized types
 * import { MessageRequest, MessageEntry, ApiResponse, ErrorCodes } from '@/types';
 * @example
 * // Or import specific type files
 * import { MessageRequest } from '@/types/messageTypes';
 * import { ApiResponse } from '@/types/apiTypes';
 */

// Barrel exports for centralized types
export * from './messageTypes';
export * from './apiTypes';
export * from './errorTypes';