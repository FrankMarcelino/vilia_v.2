"use client"

import { useQuery } from "@tanstack/react-query"
import { queryKeys } from "@/lib/react-query/keys"
import { fetchMessages } from "../api/messages.service"

/**
 * Hook para buscar mensagens de uma conversa
 * Usa React Query para cache e gerenciamento de estado
 */
export function useMessages(conversationId: string, limit = 50, offset = 0) {
  return useQuery({
    queryKey: queryKeys.messages.list(conversationId),
    queryFn: () => fetchMessages(conversationId, limit, offset),
    enabled: !!conversationId,
    staleTime: 30_000, // 30 segundos
    refetchOnWindowFocus: true,
  })
}
