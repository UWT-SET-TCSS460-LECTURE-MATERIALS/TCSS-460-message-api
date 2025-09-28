/**
 * DATABASE TRANSACTIONS - EDUCATIONAL OVERVIEW
 *
 * What is a Database Transaction?
 * ===============================
 * A database transaction is a sequence of one or more database operations that are treated as a single unit.
 * Either ALL operations succeed, or ALL operations are rolled back (undone) if any operation fails.
 * This ensures data consistency and prevents partial updates that could corrupt your database.
 *
 * Think of it like a bank transfer:
 * 1. Subtract $100 from Account A
 * 2. Add $100 to Account B
 *
 * If step 2 fails, you MUST undo step 1 - otherwise money disappears from the system!
 *
 * ACID Properties (Database Fundamentals):
 * ========================================
 * Transactions follow ACID principles:
 *
 * A - ATOMICITY: All operations succeed or all fail (no partial success)
 * C - CONSISTENCY: Database remains in a valid state before and after transaction
 * I - ISOLATION: Concurrent transactions don't interfere with each other
 * D - DURABILITY: Once committed, changes are permanent (survive system crashes)
 *
 * Transaction States:
 * ==================
 * BEGIN    - Start a new transaction
 * COMMIT   - Save all changes permanently
 * ROLLBACK - Undo all changes and return to state before BEGIN
 *
 * When to Use Transactions:
 * ========================
 * ✅ Multiple related database operations that must all succeed together
 * ✅ Operations that could leave data in an inconsistent state if partially completed
 * ✅ When you need to ensure data integrity across multiple tables
 *
 * ❌ Single, simple operations (like SELECT or single INSERT)
 * ❌ Read-only operations that don't modify data
 * ❌ Operations where partial success is acceptable
 *
 * Example Scenarios Requiring Transactions:
 * ========================================
 * 1. E-commerce order: Create order record + update inventory + charge payment
 * 2. User registration: Create user account + send welcome email + log activity
 * 3. Message system: Create message + update user stats + notify subscribers
 *
 * Simple Example Without Transactions (DANGEROUS):
 * ===============================================
 * // BAD: If step 2 fails, you have an order without inventory update!
 * await pool.query('INSERT INTO orders (user_id, total) VALUES ($1, $2)', [userId, total]);
 * await pool.query('UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1', [productId]); // Could fail!
 *
 * Safe Example With Transactions:
 * ==============================
 * const client = await pool.connect();
 * try {
 *   await client.query('BEGIN');
 *   await client.query('INSERT INTO orders (user_id, total) VALUES ($1, $2)', [userId, total]);
 *   await client.query('UPDATE inventory SET quantity = quantity - 1 WHERE product_id = $1', [productId]);
 *   await client.query('COMMIT'); // Success: both operations saved
 * } catch (error) {
 *   await client.query('ROLLBACK'); // Failure: both operations undone
 *   throw error;
 * } finally {
 *   client.release();
 * }
 *
 * The utilities below provide a clean, reusable way to handle transactions safely.
 */

import { Response } from 'express';
import { PoolClient } from 'pg';
import { getPool } from './database';
import { sendError, sendSuccess } from './responseUtils';

/**
 * Result wrapper for database transaction operations
 * Provides consistent success/failure handling with optional data payload and error information
 * Generic type T allows for type-safe data return from transaction operations
 *
 * @interface TransactionResult<T>
 * @template T The type of data returned on successful transaction completion
 * @example
 * // Successful transaction result
 * const result: TransactionResult<MessageRecord> = {
 *   success: true,
 *   data: { id: 123, name: "John", message: "Hello", priority: 1, ... }
 * };
 * @example
 * // Failed transaction result
 * const result: TransactionResult<MessageRecord> = {
 *   success: false,
 *   error: new Error("Constraint violation: duplicate key")
 * };
 * @example
 * // Usage in transaction utility functions
 * const result = await withTransaction(async (client) => {
 *   return await client.query('INSERT INTO messages...');
 * });
 * if (result.success) {
 *   console.log('Transaction completed:', result.data);
 * } else {
 *   console.error('Transaction failed:', result.error);
 * }
 */
export interface TransactionResult<T> {
    /** Indicates whether the transaction completed successfully */
    success: boolean;
    /** Optional data payload returned from successful transaction (type T) */
    data?: T;
    /** Optional error information if transaction failed */
    error?: Error;
}

/**
 * Execute operations within a database transaction
 * Automatically handles BEGIN, COMMIT, and ROLLBACK
 *
 * @param operation - Database operation function that receives a transaction client
 * @returns Promise resolving to TransactionResult with success status and optional data/error
 */
export const withTransaction = async <T>(
    // eslint-disable-next-line no-unused-vars
    operation: (transactionClient: PoolClient) => Promise<T>
): Promise<TransactionResult<T>> => {
    const pool = getPool();
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const result = await operation(client);
        await client.query('COMMIT');

        return {
            success: true,
            data: result
        };
    } catch (error) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackError) {
            console.error('Rollback error:', rollbackError);
        }

        return {
            success: false,
            error: error as Error
        };
    } finally {
        client.release();
    }
};

/**
 * Execute transaction with automatic HTTP response handling
 * Sends success/error responses automatically
 *
 * @param operation - Database operation function that receives a transaction client
 * @param response - Express response object for sending HTTP responses
 * @param successMessage - Optional success message for HTTP response
 * @param errorMessage - Error message for failed transactions (default: 'Transaction failed')
 * @returns Promise that resolves when HTTP response has been sent
 */
export const executeTransactionWithResponse = async <T>(
    // eslint-disable-next-line no-unused-vars
    operation: (transactionClient: PoolClient) => Promise<T>,
    response: Response,
    successMessage?: string,
    errorMessage: string = 'Transaction failed'
): Promise<void> => {
    const result = await withTransaction(operation);

    if (result.success) {
        sendSuccess(response, result.data, successMessage);
    } else {
        console.error('Transaction error:', result.error);
        sendError(response, 500, errorMessage);
    }
};