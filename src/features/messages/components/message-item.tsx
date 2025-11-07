"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils/cn"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/pt-br"
import type { MessageWithSender } from "../types"

dayjs.extend(relativeTime)
dayjs.locale("pt-br")

export interface MessageItemProps {
  message: MessageWithSender
  isOwn?: boolean
  showAvatar?: boolean
  showTimestamp?: boolean
}

export function MessageItem({
  message,
  isOwn = false,
  showAvatar = true,
  showTimestamp = true,
}: MessageItemProps) {
  const initials = message.sender?.full_name
    ? message.sender.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?"

  const timestamp = dayjs(message.created_at).fromNow()

  return (
    <div
      className={cn("flex gap-3 mb-4", isOwn && "flex-row-reverse")}
      data-message-id={message.id}
    >
      {showAvatar && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar_url || undefined} alt={initials} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn("flex flex-col gap-1", isOwn && "items-end")}>
        {/* Nome do sender */}
        {!isOwn && message.sender && (
          <span className="text-xs font-medium text-muted-foreground">
            {message.sender.full_name}
          </span>
        )}

        {/* Conteúdo da mensagem */}
        <div
          className={cn(
            "rounded-lg px-4 py-2 max-w-md break-words",
            isOwn ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
          )}
        >
          {/* Mídia */}
          {message.media_url && (
            <div className="mb-2">
              {message.media_type?.startsWith("image/") ? (
                <img
                  src={message.media_url}
                  alt="Mídia da mensagem"
                  className="rounded-md max-w-full h-auto"
                />
              ) : (
                <a
                  href={message.media_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline"
                >
                  Abrir arquivo
                </a>
              )}
            </div>
          )}

          {/* Texto */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp e status */}
        {showTimestamp && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">{timestamp}</span>
            {isOwn && (
              <span className="text-xs text-muted-foreground">{message.is_read ? "✓✓" : "✓"}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
