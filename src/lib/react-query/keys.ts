/**
 * Centralized query keys for React Query
 * Facilita invalidação e gerenciamento de cache
 */

export const queryKeys = {
  // Auth
  auth: {
    user: ["auth", "user"] as const,
    profile: (userId: string) => ["auth", "profile", userId] as const,
  },

  // Messages
  messages: {
    all: ["messages"] as const,
    list: (conversationId: string) => ["messages", "list", conversationId] as const,
    detail: (messageId: string) => ["messages", "detail", messageId] as const,
    unread: (conversationId: string) => ["messages", "unread", conversationId] as const,
  },

  // Conversations
  conversations: {
    all: ["conversations"] as const,
    list: (filters?: Record<string, unknown>) => ["conversations", "list", filters] as const,
    detail: (conversationId: string) => ["conversations", "detail", conversationId] as const,
    byContact: (contactId: string) => ["conversations", "byContact", contactId] as const,
  },

  // Contacts
  contacts: {
    all: ["contacts"] as const,
    list: (filters?: Record<string, unknown>) => ["contacts", "list", filters] as const,
    detail: (contactId: string) => ["contacts", "detail", contactId] as const,
    search: (query: string) => ["contacts", "search", query] as const,
  },

  // Quick Replies
  quickReplies: {
    all: ["quickReplies"] as const,
    list: (filters?: Record<string, unknown>) => ["quickReplies", "list", filters] as const,
    detail: (replyId: string) => ["quickReplies", "detail", replyId] as const,
    byCategory: (category: string) => ["quickReplies", "byCategory", category] as const,
  },
} as const
