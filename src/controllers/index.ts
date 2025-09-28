/**
 * CONTROLLERS - EDUCATIONAL OVERVIEW
 *
 * What are Controllers in Web Applications?
 * ========================================
 * Controllers are the "business logic" layer of your web application. They sit between
 * the routes (which handle HTTP requests) and your data layer (database operations).
 * Controllers contain the actual logic that processes requests and generates responses.
 *
 * MVC Architecture Pattern:
 * ========================
 * Controllers are part of the Model-View-Controller (MVC) architectural pattern:
 *
 * MODEL (Data Layer):
 * - Database operations (queries, transactions)
 * - Data validation and business rules
 * - Entity definitions and relationships
 *
 * VIEW (Presentation Layer):
 * - In web APIs, this is the JSON response format
 * - Response utilities handle the "view" formatting
 * - Frontend applications consume these JSON "views"
 *
 * CONTROLLER (Business Logic Layer):
 * - Processes incoming requests
 * - Validates input data
 * - Coordinates between models and views
 * - Handles business logic and workflows
 * - Returns formatted responses
 *
 * Controller Responsibilities:
 * ===========================
 * ✅ Extract and validate request data (body, params, query)
 * ✅ Execute business logic (create, read, update, delete operations)
 * ✅ Coordinate database operations
 * ✅ Handle errors and edge cases
 * ✅ Format and send responses using response utilities
 *
 * ❌ Controllers should NOT:
 * - Contain database connection logic (use utilities)
 * - Handle HTTP parsing (Express middleware does this)
 * - Format responses manually (use response utilities)
 * - Contain validation logic (use middleware)
 *
 * Separation of Concerns:
 * ======================
 * Good controller design separates different concerns:
 *
 * 1. ROUTES: Define URL patterns and HTTP methods
 * 2. MIDDLEWARE: Handle validation, authentication, CORS
 * 3. CONTROLLERS: Execute business logic
 * 4. UTILITIES: Handle database connections, response formatting
 * 5. MODELS: Define data structures and types
 *
 * Example Controller Flow:
 * =======================
 * 1. Route receives HTTP request: POST /message
 * 2. Middleware validates request data
 * 3. Controller extracts validated data from request.body
 * 4. Controller checks business rules (e.g., name uniqueness)
 * 5. Controller performs database operations
 * 6. Controller formats success/error response
 * 7. Response sent back to client
 *
 * Why Separate Controllers from Routes?
 * ====================================
 * ✅ Testability: Controllers can be unit tested without HTTP overhead
 * ✅ Reusability: Same controller logic can be used by different routes
 * ✅ Maintainability: Business logic is centralized and organized
 * ✅ Scalability: Easy to modify or extend business operations
 *
 * Barrel Export Pattern:
 * =====================
 * This file uses the "barrel export" pattern - it re-exports all controllers
 * from a single location. This makes imports cleaner throughout the application:
 *
 * Instead of: import { createMessage } from '../controllers/messageController';
 * You can use: import { createMessage } from '../controllers';
 *
 * The controllers below implement these patterns for the Message API.
 */

// Barrel exports for controllers
export * from './messageController';