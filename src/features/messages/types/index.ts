import type { Database } from "@/lib/supabase/types"

// Database types
export type Message = Database["public"]["Tables"]["messages"]["Row"]
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"]
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"]

// Enums
export type MessageSenderType = Database["public"]["Enums"]["message_sender_type"]

// Extended types for UI
export interface MessageWithSender extends Message {
  sender?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

// UI-specific types
export interface MessageGroup {
  date: string
  messages: MessageWithSender[]
}

// Realtime event types
export interface MessageRealtimeEvent {
  eventType: "INSERT" | "UPDATE" | "DELETE"
  new: Message
  old: Message | null
}

// Query filters
export interface MessagesQueryFilters {
  conversationId: string
  limit?: number
  offset?: number
}

// Send message payload
export interface SendMessagePayload {
  conversationId: string
  content: string
  mediaUrl?: string
  mediaType?: string
  metadata?: Record<string, unknown>
}

// Update message payload
export interface UpdateMessagePayload {
  id: string
  content?: string
  isRead?: boolean
}
