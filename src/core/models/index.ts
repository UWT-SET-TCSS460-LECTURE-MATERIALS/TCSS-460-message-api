// Type definitions for the Message API

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
 * Extends MessageObject with pre-formatted display string for client consumption
 * Used in GET endpoints to provide both raw data and formatted display text
 *
 * @interface MessageEntry
 * @augments MessageObject
 * @example
 * const entry: MessageEntry = {
 *   name: "Bob",
 *   message: "Hello API",
 *   priority: 1,
 *   formatted: "{1} - [Bob] says: Hello API"
 * };
 * @example
 * // Response from GET /message?priority=1
 * {
 *   success: true,
 *   data: {
 *     entries: [entry1, entry2], // Array of MessageEntry
 *     count: 2,
 *     priority: 1
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