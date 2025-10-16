/**
 * Message-related type definitions for the TCSS-460 Message API
 *
 * Defines the core data structures for message operations including request payloads,
 * internal data representations, API responses, and database records. Provides type
 * safety and clear interfaces for all message-related operations.
 *
 * @see {@link ../../docs/typescript-patterns.md#interface-design} for type design patterns
 * @see {@link ../../docs/api-design-patterns.md#response-formatting} for API response structures
 */

/**
 * Request payload for creating a new message
 * Used by POST /message endpoint validation and processing
 * All fields are required and validated by express-validator middleware
 *
 * @interface MessageRequest
 * @example
 * const newMessage: MessageRequest = {
 *   name: "John Doe",
 *   message: "Hello World",
 *   priority: 1
 * };
 * @example
 * // Used in controller request body
 * export const createMessage = async (request: Request, response: Response) => {
 *   const { name, message, priority }: MessageRequest = request.body;
 *   // Process validated input...
 * };
 */
export interface MessageRequest {
    /** Unique identifier for message sender (validated for uniqueness in database) */
    name: string;
    /** Content of the message to be stored (required, non-empty after trimming) */
    message: string;
    /** Priority level: 1 (highest) to 3 (lowest) */
    priority: number;
}

/**
 * Core message data structure for internal processing
 * Contains the essential message fields without database metadata or formatting
 * Used for data transformation and business logic operations
 *
 * @interface MessageObject
 * @example
 * const messageData: MessageObject = {
 *   name: "Alice",
 *   message: "Learning TypeScript",
 *   priority: 2
 * };
 * @example
 * // Used in formatMessage function
 * const formatted = formatMessage(messageObject);
 * // Returns: "{2} - [Alice] says: Learning TypeScript"
 */
export interface MessageObject {
    /** Name of the message sender */
    name: string;
    /** Text content of the message */
    message: string;
    /** Priority level (1=high, 2=medium, 3=low) */
    priority: number;
}

/**
 * API response format for message entries with display formatting
 *
 * **Standard message representation for all API responses.**
 * Extends MessageObject with pre-formatted display string for client consumption.
 * This is the consistent format returned by all message endpoints.
 *
 * **Important:** Database IDs are intentionally excluded from API responses.
 * The `name` field serves as the natural key for all CRUD operations.
 *
 * @interface MessageEntry
 * @augments MessageObject
 * @example
 * // Single message response (POST, GET by name, PATCH)
 * {
 *   success: true,
 *   data: {
 *     name: "Bob",
 *     message: "Hello API",
 *     priority: 1,
 *     formatted: "{1} - [Bob] says: Hello API"
 *   }
 * }
 * @example
 * // Collection response (GET by priority, GET all)
 * {
 *   success: true,
 *   data: {
 *     entries: [{name: "Bob", message: "Hello", priority: 1, formatted: "..."}],
 *     count: 1,
 *     priority: 1
 *   }
 * }
 * @example
 * // Delete response
 * {
 *   success: true,
 *   data: {
 *     deleted: {name: "Bob", message: "Hello", priority: 1, formatted: "..."}
 *   }
 * }
 */
export interface MessageEntry extends MessageObject {
    /** Pre-formatted display string in standard format: "{priority} - [name] says: message" */
    formatted: string;
}

/**
 * Database record structure for message table rows
 * Extends MessageObject with database-specific fields (ID, timestamps)
 * Represents the complete database row structure for internal data operations
 *
 * @interface MessageRecord
 * @augments MessageObject
 * @example
 * // Returned from database query
 * const dbRecord: MessageRecord = {
 *   id: 123,
 *   name: "Carol",
 *   message: "Database example",
 *   priority: 3,
 *   created_at: new Date('2024-01-15T10:30:00Z'),
 *   updated_at: new Date('2024-01-15T10:30:00Z')
 * };
 * @example
 * // Used in controller database operations
 * const result = await pool.query('SELECT * FROM messages WHERE id = $1', [123]);
 * const record: MessageRecord = result.rows[0];
 */
export interface MessageRecord extends MessageObject {
    /** Auto-generated unique database identifier */
    id: number;
    /** Timestamp when record was created (set by database) */
    created_at: Date;
    /** Timestamp when record was last updated (set by database) */
    updated_at: Date;
}

/**
 * Pagination parameters for page-based pagination
 * Page-based pagination is user-friendly and commonly used in web UIs
 *
 * @interface PagePaginationParams
 * @example
 * const params: PagePaginationParams = {
 *   page: 2,
 *   limit: 10
 * };
 * // Returns items 11-20
 */
export interface PagePaginationParams {
    /** Page number (1-indexed) - defaults to 1 */
    page: number;
    /** Maximum number of items per page - defaults to 10, max 100 */
    limit: number;
}

/**
 * Pagination parameters for offset-based pagination
 * Offset-based pagination provides more flexibility for custom positioning
 *
 * @interface OffsetPaginationParams
 * @example
 * const params: OffsetPaginationParams = {
 *   offset: 20,
 *   limit: 10
 * };
 * // Returns items 21-30
 */
export interface OffsetPaginationParams {
    /** Number of records to skip (0-indexed) - defaults to 0 */
    offset: number;
    /** Maximum number of items to return - defaults to 10, max 100 */
    limit: number;
}

/**
 * Metadata for page-based pagination responses
 * Provides navigation information for paginated results
 *
 * @interface PagePaginationMeta
 * @example
 * const meta: PagePaginationMeta = {
 *   page: 2,
 *   limit: 10,
 *   totalCount: 45,
 *   totalPages: 5,
 *   hasNext: true,
 *   hasPrevious: true
 * };
 */
export interface PagePaginationMeta {
    /** Current page number (1-indexed) */
    page: number;
    /** Maximum number of items per page */
    limit: number;
    /** Total number of items across all pages */
    totalCount: number;
    /** Total number of pages available */
    totalPages: number;
    /** Whether there are more pages after the current page */
    hasNext: boolean;
    /** Whether there are pages before the current page */
    hasPrevious: boolean;
}

/**
 * Metadata for offset-based pagination responses
 * Provides navigation information for offset-based paginated results
 *
 * @interface OffsetPaginationMeta
 * @example
 * const meta: OffsetPaginationMeta = {
 *   offset: 20,
 *   limit: 10,
 *   totalCount: 45,
 *   hasNext: true,
 *   hasPrevious: true
 * };
 */
export interface OffsetPaginationMeta {
    /** Current offset value (0-indexed) */
    offset: number;
    /** Maximum number of items returned */
    limit: number;
    /** Total number of items available */
    totalCount: number;
    /** Whether there are more items after current offset */
    hasNext: boolean;
    /** Whether there are items before current offset */
    hasPrevious: boolean;
}

/**
 * Paginated response structure for message collections
 * Contains both the data entries and pagination metadata
 *
 * @interface PaginatedMessageResponse
 * @example
 * // Page-based pagination response
 * const response: PaginatedMessageResponse = {
 *   entries: [
 *     {name: "John", message: "Hello", priority: 1, formatted: "{1} - [John] says: Hello"}
 *   ],
 *   pagination: {
 *     page: 1,
 *     limit: 10,
 *     totalCount: 25,
 *     totalPages: 3,
 *     hasNext: true,
 *     hasPrevious: false
 *   }
 * };
 * @example
 * // Offset-based pagination response
 * const response: PaginatedMessageResponse = {
 *   entries: [
 *     {name: "Alice", message: "Test", priority: 2, formatted: "{2} - [Alice] says: Test"}
 *   ],
 *   pagination: {
 *     offset: 10,
 *     limit: 10,
 *     totalCount: 25,
 *     hasNext: true,
 *     hasPrevious: true
 *   }
 * };
 */
export interface PaginatedMessageResponse {
    /** Array of message entries for the current page/offset */
    entries: MessageEntry[];
    /** Pagination metadata - structure varies based on pagination type used */
    pagination: PagePaginationMeta | OffsetPaginationMeta;
}