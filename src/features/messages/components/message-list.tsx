"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageItem } from "./message-item"
import { useMessages, useRealtimeMessages } from "../hooks"
import { useAuth } from "@/features/auth/context/auth-context"
import { cn } from "@/lib/utils/cn"

export interface MessageListProps {
  conversationId: string
  className?: string
  showAvatars?: boolean
  showTimestamps?: boolean
  autoScroll?: boolean
}

export function MessageList({
  conversationId,
  className,
  showAvatars = true,
  showTimestamps = true,
  autoScroll = true,
}: MessageListProps) {
  const { user } = useAuth()
  const { data: messages, isLoading, error } = useMessages(conversationId)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Subscrever em realtime
  useRealtimeMessages(conversationId)

  // Auto scroll para última mensagem
  useEffect(() => {
    if (autoScroll && messages && messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, autoScroll])

  if (isLoading) {
    return (
      <div className={cn("flex flex-col gap-4 p-4", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Erro ao carregar mensagens</p>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : "Tente novamente"}
          </p>
        </div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
          <p className="text-xs text-muted-foreground mt-1">
            Envie a primeira mensagem para iniciar a conversa
          </p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="p-4">
        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            isOwn={message.sender_id === user?.id}
            showAvatar={showAvatars}
            showTimestamp={showTimestamps}
          />
        ))}
        <div ref={scrollRef} />
      </div>
    </ScrollArea>
  )
}
