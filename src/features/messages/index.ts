/**
 * Messages feature exports
 */

// Types
export type {
  Message,
  MessageInsert,
  MessageUpdate,
  MessageSenderType,
  MessageWithSender,
  MessageGroup,
  MessagesQueryFilters,
  SendMessagePayload,
  UpdateMessagePayload,
} from "./types"

// Hooks
export {
  useMessages,
  useSendMessage,
  useMarkMessagesAsRead,
  useUnreadCount,
  useRealtimeMessages,
} from "./hooks"

// Components
export { MessageItem, MessageList, MessageInput } from "./components"
export type { MessageItemProps, MessageListProps, MessageInputProps } from "./components"

// API (se necessário usar diretamente)
export * from "./api/messages.service"
