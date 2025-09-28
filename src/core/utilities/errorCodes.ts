/**
 * Error codes re-export from centralized types
 *
 * This file maintains backward compatibility while types are now centralized
 * in /src/types/. Import from @/types directly for new code.
 *
 * @deprecated Use import { ErrorCodes } from '@/types' instead
 * @see {@link ../../types/errorTypes.ts} for the centralized error definitions
 */

export { ErrorCodes, type ErrorCode } from '@/types/errorTypes';