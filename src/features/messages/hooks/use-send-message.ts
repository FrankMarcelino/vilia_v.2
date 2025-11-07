"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/keys"
import { sendMessage } from "../api/messages.service"
import type { SendMessagePayload, MessageWithSender } from "../types"
import { toast } from "sonner"

/**
 * Hook para enviar mensagem com optimistic update
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: sendMessage,

    // Optimistic update
    onMutate: async (newMessage: SendMessagePayload) => {
      // Cancelar queries em andamento para evitar conflitos
      await queryClient.cancelQueries({
        queryKey: queryKeys.messages.list(newMessage.conversationId),
      })

      // Snapshot do estado anterior
      const previousMessages = queryClient.getQueryData<MessageWithSender[]>(
        queryKeys.messages.list(newMessage.conversationId)
      )

      // Criar mensagem temporária
      const tempMessage: MessageWithSender = {
        id: `temp-${Date.now()}`,
        conversation_id: newMessage.conversationId,
        sender_id: null,
        sender_type: "atendente", // Será ajustado no backend
        content: newMessage.content,
        media_url: newMessage.mediaUrl || null,
        media_type: newMessage.mediaType || null,
        metadata: (newMessage.metadata || {}) as Record<string, never>,
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        sender: undefined,
      }

      // Atualização otimista - adicionar mensagem temporária
      queryClient.setQueryData<MessageWithSender[]>(
        queryKeys.messages.list(newMessage.conversationId),
        (old = []) => [...old, tempMessage]
      )

      // Retornar contexto para rollback em caso de erro
      return { previousMessages, tempMessage }
    },

    // Rollback em caso de erro
    onError: (error, variables, context) => {
      console.error("Erro ao enviar mensagem:", error)

      if (context?.previousMessages) {
        queryClient.setQueryData(
          queryKeys.messages.list(variables.conversationId),
          context.previousMessages
        )
      }

      toast.error("Erro ao enviar mensagem", {
        description: error instanceof Error ? error.message : "Tente novamente",
      })
    },

    // Revalidar após sucesso
    onSuccess: (data, variables) => {
      // Invalidar lista de mensagens para refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(variables.conversationId),
      })

      // Invalidar também a lista de conversas (para atualizar last_message_at)
      queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      })
    },
  })
}
