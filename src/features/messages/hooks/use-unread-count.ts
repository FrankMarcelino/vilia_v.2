"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/keys"
import { countUnreadMessages } from "../api/messages.service"

/**
 * Hook para contar mensagens não lidas de uma conversa
 */
export function useUnreadCount(conversationId: string) {
  return useQuery({
    queryKey: queryKeys.messages.unread(conversationId),
    queryFn: () => countUnreadMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 10_000, // 10 segundos
    refetchInterval: 30_000, // Refetch a cada 30 segundos
  })
}
