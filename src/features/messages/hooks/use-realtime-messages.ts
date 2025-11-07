"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { createBrowserClient } from "@/lib/supabase/client"
import { queryKeys } from "@/lib/react-query/keys"
import type { MessageWithSender, Message } from "../types"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

/**
 * Hook para subscrever mensagens em tempo real
 * Atualiza o cache do React Query quando novas mensagens chegam
 */
export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient()
  const supabase = createBrowserClient()

  useEffect(() => {
    if (!conversationId) return

    // Criar canal de realtime
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on<Message>(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log("Nova mensagem recebida:", payload.new)

          const message = payload.new as Message

          // Buscar dados do sender para incluir na mensagem
          const { data: sender } = await supabase
            .from("users")
            .select("id, full_name, avatar_url")
            .eq("id", message.sender_id || "")
            .single()

          const newMessage: MessageWithSender = {
            ...message,
            sender: sender || undefined,
          }

          // Atualizar cache do React Query
          queryClient.setQueryData<MessageWithSender[]>(
            queryKeys.messages.list(conversationId),
            (old = []) => {
              // Evitar duplicatas
              const exists = old.some((msg) => msg.id === newMessage.id)
              if (exists) return old

              return [...old, newMessage]
            }
          )

          // Invalidar contador de não lidas
          queryClient.invalidateQueries({
            queryKey: queryKeys.messages.unread(conversationId),
          })

          // Invalidar lista de conversas (para atualizar last_message_at)
          queryClient.invalidateQueries({
            queryKey: queryKeys.conversations.all,
          })
        }
      )
      .on<Message>(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log("Mensagem atualizada:", payload.new)

          const newMessage = payload.new as Message
          const oldMessage = payload.old as Message | null

          // Atualizar mensagem no cache
          queryClient.setQueryData<MessageWithSender[]>(
            queryKeys.messages.list(conversationId),
            (old = []) => {
              return old.map((msg) => (msg.id === newMessage.id ? { ...msg, ...newMessage } : msg))
            }
          )

          // Invalidar contador de não lidas se o status de leitura mudou
          if (newMessage.is_read !== oldMessage?.is_read) {
            queryClient.invalidateQueries({
              queryKey: queryKeys.messages.unread(conversationId),
            })
          }
        }
      )
      .on<Message>(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          console.log("Mensagem deletada:", payload.old)

          const oldMessage = payload.old as Message

          // Remover mensagem do cache
          queryClient.setQueryData<MessageWithSender[]>(
            queryKeys.messages.list(conversationId),
            (old = []) => {
              return old.filter((msg) => msg.id !== oldMessage.id)
            }
          )
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log(`✅ Subscrito em mensagens da conversa: ${conversationId}`)
        }
        if (status === "CHANNEL_ERROR") {
          console.error("❌ Erro ao subscrever em mensagens")
        }
      })

    // SEMPRE limpar subscription ao desmontar
    return () => {
      console.log(`🔌 Desconectando de mensagens da conversa: ${conversationId}`)
      supabase.removeChannel(channel)
    }
  }, [conversationId, queryClient, supabase])
}
