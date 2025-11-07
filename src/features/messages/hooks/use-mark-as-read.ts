"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/keys"
import { markMessagesAsRead } from "../api/messages.service"
import { toast } from "sonner"

interface MarkAsReadParams {
  conversationId: string
  messageIds?: string[]
}

/**
 * Hook para marcar mensagens como lidas
 */
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, messageIds }: MarkAsReadParams) =>
      markMessagesAsRead(conversationId, messageIds),

    onSuccess: (_, variables) => {
      // Invalidar mensagens da conversa
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.list(variables.conversationId),
      })

      // Invalidar contador de não lidas
      queryClient.invalidateQueries({
        queryKey: queryKeys.messages.unread(variables.conversationId),
      })
    },

    onError: (error) => {
      console.error("Erro ao marcar mensagens como lidas:", error)
      toast.error("Erro ao marcar mensagens como lidas")
    },
  })
}
