/**
 * Query keys centralizados para React Query
 *
 * Estrutura hierárquica:
 * - all: ['entity']
 * - lists: ['entity', 'list']
 * - list: ['entity', 'list', filter]
 * - details: ['entity', 'detail']
 * - detail: ['entity', 'detail', id]
 */

export const queryKeys = {
  // Messages
  messages: {
    all: ["messages"] as const,
    lists: () => [...queryKeys.messages.all, "list"] as const,
    list: (conversationId: string) => [...queryKeys.messages.lists(), conversationId] as const,
    details: () => [...queryKeys.messages.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.messages.details(), id] as const,
  },

  // Conversations
  conversations: {
    all: ["conversations"] as const,
    lists: () => [...queryKeys.conversations.all, "list"] as const,
    list: (contactId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.conversations.lists(), contactId, filters] as const,
    details: () => [...queryKeys.conversations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.conversations.details(), id] as const,
  },

  // Contacts
  contacts: {
    all: ["contacts"] as const,
    lists: () => [...queryKeys.contacts.all, "list"] as const,
    list: (tenantId: string, filters?: Record<string, unknown>) =>
      [...queryKeys.contacts.lists(), tenantId, filters] as const,
    details: () => [...queryKeys.contacts.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.contacts.details(), id] as const,
  },

  // Users
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (tenantId?: string) => [...queryKeys.users.lists(), tenantId] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },

  // Tenants
  tenants: {
    all: ["tenants"] as const,
    lists: () => [...queryKeys.tenants.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.tenants.lists(), filters] as const,
    details: () => [...queryKeys.tenants.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tenants.details(), id] as const,
  },

  // Agents
  agents: {
    all: ["agents"] as const,
    lists: () => [...queryKeys.agents.all, "list"] as const,
    list: (filters?: Record<string, unknown>) => [...queryKeys.agents.lists(), filters] as const,
    details: () => [...queryKeys.agents.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.agents.details(), id] as const,
  },
}
