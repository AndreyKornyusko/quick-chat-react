/**
 * Centralized query key factory for TanStack Query.
 * All keys are prefixed with "qc:" to avoid collisions when the library
 * is used inside a consumer app that also uses TanStack Query.
 */
export const qk = {
  conversations: (userId?: string) => ["qc:conversations", userId] as const,
  messages: (convId: string | null) => ["qc:messages", convId] as const,
  unreadIds: (convId: string | null, userId?: string) => ["qc:unread-ids", convId, userId] as const,
  contacts: (userId?: string) => ["qc:contacts", userId] as const,
  searchUsers: (query: string) => ["qc:searchUsers", query] as const,
  profile: (userId?: string) => ["qc:profile", userId] as const,
  reactions: (convId: string | null) => ["qc:reactions", convId] as const,
};
