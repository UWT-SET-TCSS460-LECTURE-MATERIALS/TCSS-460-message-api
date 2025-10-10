/**
 * Unit tests for API Key utility functions
 *
 * Tests the generation and validation of API keys used for authentication.
 * Demonstrates proper testing patterns for cryptographic functions and
 * format validation logic.
 */

import { generateApiKey, isValidApiKeyFormat } from '../apiKeyUtils';

describe('API Key Utilities', () => {
    describe('generateApiKey', () => {
        test('should generate a valid UUID v4 string', () => {
            const apiKey = generateApiKey();

            // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
            const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

            expect(apiKey).toMatch(uuidV4Pattern);
        });

        test('should generate unique keys on multiple calls', () => {
            const key1 = generateApiKey();
            const key2 = generateApiKey();
            const key3 = generateApiKey();

            expect(key1).not.toBe(key2);
            expect(key2).not.toBe(key3);
            expect(key1).not.toBe(key3);
        });

        test('should generate keys of correct length (36 characters with hyphens)', () => {
            const apiKey = generateApiKey();

            expect(apiKey).toHaveLength(36);
        });

        test('should generate keys with hyphens in correct positions', () => {
            const apiKey = generateApiKey();

            expect(apiKey.charAt(8)).toBe('-');
            expect(apiKey.charAt(13)).toBe('-');
            expect(apiKey.charAt(18)).toBe('-');
            expect(apiKey.charAt(23)).toBe('-');
        });

        test('should generate multiple unique keys (collision test)', () => {
            const keys = new Set<string>();
            const iterations = 1000;

            for (let i = 0; i < iterations; i++) {
                keys.add(generateApiKey());
            }

            // All keys should be unique (no collisions)
            expect(keys.size).toBe(iterations);
        });
    });

    describe('isValidApiKeyFormat', () => {
        test('should return true for valid UUID v4 format', () => {
            const validKey = '550e8400-e29b-41d4-a716-446655440000';

            expect(isValidApiKeyFormat(validKey)).toBe(true);
        });

        test('should return true for generated API keys', () => {
            const generatedKey = generateApiKey();

            expect(isValidApiKeyFormat(generatedKey)).toBe(true);
        });

        test('should return true for uppercase UUID', () => {
            const uppercaseKey = '550E8400-E29B-41D4-A716-446655440000';

            expect(isValidApiKeyFormat(uppercaseKey)).toBe(true);
        });

        test('should return true for mixed case UUID', () => {
            const mixedCaseKey = '550e8400-E29b-41D4-a716-446655440000';

            expect(isValidApiKeyFormat(mixedCaseKey)).toBe(true);
        });

        test('should return false for empty string', () => {
            expect(isValidApiKeyFormat('')).toBe(false);
        });

        test('should return false for non-UUID string', () => {
            expect(isValidApiKeyFormat('not-a-uuid')).toBe(false);
            expect(isValidApiKeyFormat('12345')).toBe(false);
            expect(isValidApiKeyFormat('invalid-key-format')).toBe(false);
        });

        test('should return false for UUID with missing hyphens', () => {
            const noHyphens = '550e8400e29b41d4a716446655440000';

            expect(isValidApiKeyFormat(noHyphens)).toBe(false);
        });

        test('should return false for UUID with wrong number of characters', () => {
            const tooShort = '550e8400-e29b-41d4-a716-44665544000';
            const tooLong = '550e8400-e29b-41d4-a716-4466554400000';

            expect(isValidApiKeyFormat(tooShort)).toBe(false);
            expect(isValidApiKeyFormat(tooLong)).toBe(false);
        });

        test('should return false for UUID with hyphens in wrong positions', () => {
            const wrongHyphens = '550e840-0e29b-41d4-a716-446655440000';

            expect(isValidApiKeyFormat(wrongHyphens)).toBe(false);
        });

        test('should return false for UUID v1/v3/v5 (not v4)', () => {
            const uuidV1 = '550e8400-e29b-11d4-a716-446655440000'; // version 1
            const uuidV3 = '550e8400-e29b-31d4-a716-446655440000'; // version 3
            const uuidV5 = '550e8400-e29b-51d4-a716-446655440000'; // version 5

            expect(isValidApiKeyFormat(uuidV1)).toBe(false);
            expect(isValidApiKeyFormat(uuidV3)).toBe(false);
            expect(isValidApiKeyFormat(uuidV5)).toBe(false);
        });

        test('should return false for UUID with invalid variant bits', () => {
            // Variant bits (position 19) must be 8, 9, a, or b
            const invalidVariant1 = '550e8400-e29b-41d4-0716-446655440000'; // starts with 0
            const invalidVariant2 = '550e8400-e29b-41d4-c716-446655440000'; // starts with c
            const invalidVariant3 = '550e8400-e29b-41d4-f716-446655440000'; // starts with f

            expect(isValidApiKeyFormat(invalidVariant1)).toBe(false);
            expect(isValidApiKeyFormat(invalidVariant2)).toBe(false);
            expect(isValidApiKeyFormat(invalidVariant3)).toBe(false);
        });

        test('should return false for UUID with invalid hex characters', () => {
            const invalidHex = '550e8400-e29b-41d4-a716-44665544000g'; // 'g' is not hex

            expect(isValidApiKeyFormat(invalidHex)).toBe(false);
        });

        test('should return false for null or undefined', () => {
            expect(isValidApiKeyFormat(null as any)).toBe(false);
            expect(isValidApiKeyFormat(undefined as any)).toBe(false);
        });

        test('should return false for special characters', () => {
            expect(isValidApiKeyFormat('550e8400-e29b-41d4-a716-44665544000@')).toBe(false);
            expect(isValidApiKeyFormat('550e8400-e29b-41d4-a716-44665544000!')).toBe(false);
        });
    });

    describe('Integration: generation and validation', () => {
        test('should validate all generated keys', () => {
            for (let i = 0; i < 100; i++) {
                const key = generateApiKey();
                expect(isValidApiKeyFormat(key)).toBe(true);
            }
        });

        test('should generate keys that match UUID v4 specification', () => {
            const key = generateApiKey();

            // Check version bits (position 14 should be '4')
            expect(key.charAt(14)).toBe('4');

            // Check variant bits (position 19 should be 8, 9, a, or b)
            const variantChar = key.charAt(19).toLowerCase();
            expect(['8', '9', 'a', 'b']).toContain(variantChar);
        });
    });
});
