/**
 * Controller barrel exports implementing MVC business logic layer
 *
 * Controllers handle the business logic between routes and data layer,
 * processing requests, coordinating database operations, and formatting
 * responses. Implements separation of concerns and professional patterns.
 *
 * @see {@link ../../docs/node-express-architecture.md#mvc-architecture-pattern} for MVC concepts
 * @see {@link ../../docs/node-express-architecture.md#controller-responsibilities} for responsibilities
 * @see {@link ../../docs/node-express-architecture.md#separation-of-concerns} for design patterns
 * @example
 * // Clean barrel import pattern
 * import { createMessage, getAllMessages } from '@controllers';
 */

// Barrel exports for controllers
export * from './messageController';
export * from './apiKeyController';