/**
 * Input validation utilities for secure, type-safe data handling
 *
 * Provides reusable validation functions for common input scenarios including
 * string presence, email/phone formats, numeric values, and length constraints.
 * Implements server-side validation patterns with proper type checking and
 * sanitization for web API security.
 *
 * @see {@link ../../docs/validation-strategies.md#input-validation} for validation concepts
 * @see {@link ../../docs/validation-strategies.md#validation-vs-sanitization} for approach patterns
 * @see {@link ../../docs/web-security-guide.md#input-validation-security} for security considerations
 * @see {@link ../../docs/validation-strategies.md#regex-patterns} for regular expression patterns
 */

/**
 * Check if a string is provided and not empty after trimming whitespace
 * Validates both type and meaningful content presence
 *
 * @param value - Value to check (can be any type)
 * @returns boolean indicating if value is a non-empty string
 * @example
 * isStringProvided("hello")     // true
 * isStringProvided("  ")        // false (whitespace only)
 * isStringProvided("")          // false (empty)
 * isStringProvided(null)        // false (not a string)
 * isStringProvided(123)         // false (not a string)
 * @example
 * // Usage in validation logic
 * if (!isStringProvided(request.body.name)) {
 *   return sendError(response, 400, "Name is required");
 * }
 */
export const isStringProvided = (value: any): boolean => {
    return typeof value === 'string' && value.trim().length > 0;
};

/**
 * Validate email address format using regex pattern
 * Checks for basic email structure: localpart@domain.extension
 * Note: This is a simple validation - for production, consider more robust email validation
 *
 * @param email - Email string to validate
 * @returns boolean indicating if email format is valid
 * @example
 * isValidEmail("user@example.com")    // true
 * isValidEmail("test.email@site.org") // true
 * isValidEmail("invalid.email")       // false (no @)
 * isValidEmail("@domain.com")         // false (no local part)
 * isValidEmail("user@")               // false (no domain)
 * @example
 * // Usage in user registration
 * if (!isValidEmail(request.body.email)) {
 *   return sendError(response, 400, "Please provide a valid email address");
 * }
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate US phone number format with flexible formatting
 * Accepts various common formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
 * This is a basic validation - international formats would need different patterns
 *
 * @param phone - Phone number string to validate
 * @returns boolean indicating if phone format is valid
 * @example
 * isValidPhone("(123) 456-7890") // true
 * isValidPhone("123-456-7890")   // true
 * isValidPhone("123.456.7890")   // true
 * isValidPhone("1234567890")     // true
 * isValidPhone("123-45-6789")    // false (wrong grouping)
 * isValidPhone("phone")          // false (not numbers)
 * @example
 * // Usage in contact form validation
 * if (!isValidPhone(request.body.phone)) {
 *   return sendError(response, 400, "Please provide a valid phone number");
 * }
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    return phoneRegex.test(phone);
};

/**
 * Check if value can be converted to a valid number (integer or decimal)
 * Handles string numbers, actual numbers, and rejects non-numeric values
 * Uses JavaScript's built-in number parsing with NaN checking
 *
 * @param value - Value to check (can be any type)
 * @returns boolean indicating if value represents a valid number
 * @example
 * isValidNumber(123)        // true
 * isValidNumber("123")      // true
 * isValidNumber(123.45)     // true
 * isValidNumber("123.45")   // true
 * isValidNumber("-123")     // true (negative numbers)
 * isValidNumber("abc")      // false
 * isValidNumber("")         // false
 * isValidNumber(null)       // false
 * @example
 * // Usage in numeric input validation
 * if (!isValidNumber(request.body.price)) {
 *   return sendError(response, 400, "Price must be a valid number");
 * }
 */
export const isValidNumber = (value: any): boolean => {
    return !isNaN(value) && !isNaN(parseFloat(value));
};

/**
 * Check if value is a valid integer (whole number, no decimals)
 * More strict than isValidNumber - rejects decimal values
 * Useful for IDs, counts, quantities, and other whole-number fields
 *
 * @param value - Value to check (can be any type)
 * @returns boolean indicating if value is a valid integer
 * @example
 * isValidInteger(123)     // true
 * isValidInteger("123")   // true
 * isValidInteger(-123)    // true (negative integers)
 * isValidInteger(123.45)  // false (has decimals)
 * isValidInteger("123.0") // false (parsed as decimal)
 * isValidInteger("abc")   // false (not a number)
 * @example
 * // Usage for ID validation
 * if (!isValidInteger(request.params.userId)) {
 *   return sendError(response, 400, "User ID must be a valid integer");
 * }
 */
export const isValidInteger = (value: any): boolean => {
    return Number.isInteger(Number(value));
};

/**
 * Validate string length is within specified minimum and maximum bounds
 * Trims whitespace before checking length to ensure meaningful content
 * Essential for preventing database field overflow and ensuring data quality
 *
 * @param value - String to validate
 * @param min - Minimum allowed length (inclusive)
 * @param max - Maximum allowed length (inclusive)
 * @returns boolean indicating if string length is within bounds
 * @example
 * isValidLength("hello", 1, 10)      // true (5 chars, within 1-10)
 * isValidLength("hi", 3, 10)         // false (2 chars, below minimum)
 * isValidLength("very long text", 1, 5) // false (14 chars, above maximum)
 * isValidLength("  ok  ", 1, 5)      // true (2 chars after trim)
 * @example
 * // Usage for message content validation
 * if (!isValidLength(request.body.message, 1, 500)) {
 *   return sendError(response, 400, "Message must be between 1 and 500 characters");
 * }
 */
export const isValidLength = (value: string, min: number, max: number): boolean => {
    const length = value.trim().length;
    return length >= min && length <= max;
};

/**
 * Sanitize string input by removing potentially harmful characters
 * Removes angle brackets that could be used for HTML/XML injection attacks
 * Trims whitespace to clean up user input
 * Note: This is basic sanitization - consider more robust libraries for production
 *
 * @param input - String to sanitize
 * @returns Sanitized string with harmful characters removed
 * @example
 * sanitizeString("  Hello World  ")     // "Hello World"
 * sanitizeString("<script>alert()</script>") // "scriptalert()script"
 * sanitizeString("Safe text")           // "Safe text"
 * sanitizeString("Text with < and >")   // "Text with  and "
 * @example
 * // Usage in content processing
 * const cleanMessage = sanitizeString(request.body.message);
 * // Now safe to store in database and display to users
 */
export const sanitizeString = (input: string): string => {
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Validate priority level for message API (domain-specific validation)
 * Enforces business rule: priority must be integer between 1 (highest) and 3 (lowest)
 * This is an example of domain-specific validation beyond basic type checking
 *
 * @param priority - Priority value to validate (can be any type)
 * @returns boolean indicating if priority is valid (1, 2, or 3)
 * @example
 * isValidPriority(1)      // true (high priority)
 * isValidPriority(2)      // true (medium priority)
 * isValidPriority(3)      // true (low priority)
 * isValidPriority("2")    // true (string numbers accepted)
 * isValidPriority(0)      // false (below minimum)
 * isValidPriority(4)      // false (above maximum)
 * isValidPriority(1.5)    // false (not an integer)
 * isValidPriority("high") // false (not a number)
 * @example
 * // Usage in message validation
 * if (!isValidPriority(request.body.priority)) {
 *   return sendError(response, 400, "Priority must be 1 (high), 2 (medium), or 3 (low)");
 * }
 */
export const isValidPriority = (priority: any): boolean => {
    const num = parseInt(priority);
    return Number.isInteger(num) && num >= 1 && num <= 3;
};