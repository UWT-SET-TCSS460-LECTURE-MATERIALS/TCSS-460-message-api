/**
 * Message model types re-export from centralized types
 *
 * This file maintains backward compatibility while types are now centralized
 * in /src/types/. Import from @/types directly for new code.
 *
 * @deprecated Use import { MessageRequest, MessageEntry, etc. } from '@/types' instead
 * @see {@link ../../types/messageTypes.ts} for the centralized message type definitions
 */

export type {
    MessageRequest,
    MessageObject,
    MessageEntry,
    MessageRecord
} from '@/types/messageTypes';