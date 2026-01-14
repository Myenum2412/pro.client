/**
 * Local Storage utilities for chat messages
 * Saves messages to local storage when API calls fail
 */

export type PendingChatMessage = {
  id: string;
  projectId?: string;
  message: string;
  files?: string[]; // File names (files themselves can't be stored in localStorage)
  timestamp: string;
  retryCount: number;
};

const STORAGE_KEY_PREFIX = "chat_pending_messages";
const MAX_RETRY_COUNT = 3;

/**
 * Get storage key for a specific project
 */
function getStorageKey(projectId?: string): string {
  return projectId 
    ? `${STORAGE_KEY_PREFIX}_${projectId}` 
    : `${STORAGE_KEY_PREFIX}_global`;
}

/**
 * Save a failed message to local storage
 */
export function savePendingMessage(
  message: string,
  projectId?: string,
  files?: File[]
): string {
  const messageId = `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const storageKey = getStorageKey(projectId);
  
  try {
    const existing = getPendingMessages(projectId);
    const fileNames = files?.map(f => f.name) || [];
    
    const pendingMessage: PendingChatMessage = {
      id: messageId,
      projectId,
      message,
      files: fileNames,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };
    
    existing.push(pendingMessage);
    localStorage.setItem(storageKey, JSON.stringify(existing));
    
    return messageId;
  } catch (error) {
    console.error("Failed to save message to local storage:", error);
    return messageId;
  }
}

/**
 * Get all pending messages for a project
 */
export function getPendingMessages(projectId?: string): PendingChatMessage[] {
  const storageKey = getStorageKey(projectId);
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return [];
    
    const messages = JSON.parse(stored) as PendingChatMessage[];
    return messages.filter(m => m.retryCount < MAX_RETRY_COUNT);
  } catch (error) {
    console.error("Failed to read pending messages from local storage:", error);
    return [];
  }
}

/**
 * Remove a pending message (when successfully sent)
 */
export function removePendingMessage(messageId: string, projectId?: string): void {
  const storageKey = getStorageKey(projectId);
  
  try {
    const existing = getPendingMessages(projectId);
    const filtered = existing.filter(m => m.id !== messageId);
    localStorage.setItem(storageKey, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove pending message from local storage:", error);
  }
}

/**
 * Increment retry count for a pending message
 */
export function incrementRetryCount(messageId: string, projectId?: string): void {
  const storageKey = getStorageKey(projectId);
  
  try {
    const existing = getPendingMessages(projectId);
    const updated = existing.map(m => 
      m.id === messageId 
        ? { ...m, retryCount: m.retryCount + 1 }
        : m
    );
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update retry count in local storage:", error);
  }
}

/**
 * Clear all pending messages for a project
 */
export function clearPendingMessages(projectId?: string): void {
  const storageKey = getStorageKey(projectId);
  
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear pending messages from local storage:", error);
  }
}

/**
 * Get all pending messages across all projects
 */
export function getAllPendingMessages(): PendingChatMessage[] {
  try {
    const allMessages: PendingChatMessage[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const messages = JSON.parse(stored) as PendingChatMessage[];
            allMessages.push(...messages.filter(m => m.retryCount < MAX_RETRY_COUNT));
          }
        } catch (error) {
          console.error(`Failed to parse messages from ${key}:`, error);
        }
      }
    });
    
    return allMessages;
  } catch (error) {
    console.error("Failed to get all pending messages:", error);
    return [];
  }
}
