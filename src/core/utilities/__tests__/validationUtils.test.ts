import {
    isStringProvided,
    isValidEmail,
    isValidPhone,
    isValidNumber,
    isValidInteger,
    isValidLength,
    sanitizeString,
    isValidPriority
} from '../validationUtils';

describe('validationUtils', () => {
    describe('isStringProvided', () => {
        it('should return true for valid strings', () => {
            expect(isStringProvided('hello')).toBe(true);
            expect(isStringProvided('  hello  ')).toBe(true);
        });

        it('should return false for invalid inputs', () => {
            expect(isStringProvided('')).toBe(false);
            expect(isStringProvided('   ')).toBe(false);
            expect(isStringProvided(null)).toBe(false);
            expect(isStringProvided(undefined)).toBe(false);
        });
    });

    describe('isValidEmail', () => {
        it('should validate correct email formats', () => {
            expect(isValidEmail('test@example.com')).toBe(true);
            expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
        });

        it('should reject invalid email formats', () => {
            expect(isValidEmail('invalid')).toBe(false);
            expect(isValidEmail('@domain.com')).toBe(false);
            expect(isValidEmail('user@')).toBe(false);
        });
    });

    describe('isValidPriority', () => {
        it('should validate correct priority values', () => {
            expect(isValidPriority(1)).toBe(true);
            expect(isValidPriority(2)).toBe(true);
            expect(isValidPriority(3)).toBe(true);
        });

        it('should reject invalid priority values', () => {
            expect(isValidPriority(0)).toBe(false);
            expect(isValidPriority(4)).toBe(false);
            expect(isValidPriority('1')).toBe(false);
            expect(isValidPriority(null)).toBe(false);
        });
    });
});