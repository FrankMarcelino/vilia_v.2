import { createBrowserClient } from "@/lib/supabase/client"
import type { Message, MessageWithSender, SendMessagePayload, UpdateMessagePayload } from "../types"

/**
 * Buscar mensagens de uma conversa
 */
export async function fetchMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<MessageWithSender[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      *,
      sender:users!messages_sender_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Erro ao buscar mensagens:", error)
    throw new Error(error.message)
  }

  return (data as MessageWithSender[]) || []
}

/**
 * Enviar mensagem
 */
export async function sendMessage(payload: SendMessagePayload): Promise<Message> {
  const supabase = createBrowserClient()

  // Buscar usuário atual
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  // Buscar role do usuário
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single()

  const senderType = profile?.role === "cliente" ? "client" : "atendente"

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: payload.conversationId,
      sender_id: user.id,
      sender_type: senderType,
      content: payload.content,
      media_url: payload.mediaUrl,
      media_type: payload.mediaType,
      metadata: payload.metadata || {},
    })
    .select()
    .single()

  if (error) {
    console.error("Erro ao enviar mensagem:", error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Atualizar mensagem
 */
export async function updateMessage(payload: UpdateMessagePayload): Promise<Message> {
  const supabase = createBrowserClient()

  const updateData: Record<string, unknown> = {}

  if (payload.content !== undefined) {
    updateData.content = payload.content
  }

  if (payload.isRead !== undefined) {
    updateData.is_read = payload.isRead
    if (payload.isRead) {
      updateData.read_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from("messages")
    .update(updateData)
    .eq("id", payload.id)
    .select()
    .single()

  if (error) {
    console.error("Erro ao atualizar mensagem:", error)
    throw new Error(error.message)
  }

  return data
}

/**
 * Marcar mensagens como lidas
 */
export async function markMessagesAsRead(
  conversationId: string,
  messageIds?: string[]
): Promise<void> {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  let query = supabase
    .from("messages")
    .update({
      is_read: true,
      read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", user.id) // Não marcar próprias mensagens

  if (messageIds && messageIds.length > 0) {
    query = query.in("id", messageIds)
  }

  const { error } = await query

  if (error) {
    console.error("Erro ao marcar mensagens como lidas:", error)
    throw new Error(error.message)
  }
}

/**
 * Deletar mensagem (soft delete - apenas atualiza conteúdo)
 */
export async function deleteMessage(messageId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from("messages")
    .update({
      content: "[Mensagem deletada]",
      metadata: { deleted: true, deleted_at: new Date().toISOString() },
    })
    .eq("id", messageId)

  if (error) {
    console.error("Erro ao deletar mensagem:", error)
    throw new Error(error.message)
  }
}

/**
 * Contar mensagens não lidas de uma conversa
 */
export async function countUnreadMessages(conversationId: string): Promise<number> {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuário não autenticado")
  }

  const { count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("is_read", false)
    .neq("sender_id", user.id)

  if (error) {
    console.error("Erro ao contar mensagens não lidas:", error)
    throw new Error(error.message)
  }

  return count || 0
}
