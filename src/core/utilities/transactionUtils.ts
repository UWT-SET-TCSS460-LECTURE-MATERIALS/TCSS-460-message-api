/**
 * Database transaction utilities providing safe, atomic operations
 *
 * Handles BEGIN/COMMIT/ROLLBACK automatically with proper error handling,
 * connection management, and consistent result formatting. Implements
 * production-ready transaction patterns for multi-step database operations.
 *
 * @see {@link ../../docs/database-fundamentals.md#database-transactions} for transaction concepts
 * @see {@link ../../docs/database-fundamentals.md#acid-properties} for ACID properties
 * @example
 * // Simple transaction usage
 * const result = await withTransaction(async (client) => {
 *   const order = await client.query('INSERT INTO orders...');
 *   await client.query('UPDATE inventory...');
 *   return order.rows[0];
 * });
 * @example
 * // Transaction with automatic HTTP response
 * await executeTransactionWithResponse(
 *   async (client) => await createOrderAndUpdateInventory(client),
 *   response,
 *   "Order created successfully"
 * );
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