"use client"

import { useState, KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Loader2 } from "lucide-react"
import { useSendMessage } from "../hooks"
import { cn } from "@/lib/utils/cn"
import { toast } from "sonner"

export interface MessageInputProps {
  conversationId: string
  placeholder?: string
  className?: string
  onMessageSent?: () => void
  maxLength?: number
}

export function MessageInput({
  conversationId,
  placeholder = "Digite sua mensagem...",
  className,
  onMessageSent,
  maxLength = 5000,
}: MessageInputProps) {
  const [content, setContent] = useState("")
  const sendMessage = useSendMessage()

  const handleSend = async () => {
    const trimmedContent = content.trim()

    if (!trimmedContent) {
      toast.warning("Digite uma mensagem antes de enviar")
      return
    }

    if (trimmedContent.length > maxLength) {
      toast.error(`Mensagem muito longa (máximo ${maxLength} caracteres)`)
      return
    }

    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: trimmedContent,
      })

      // Limpar input após envio
      setContent("")

      // Callback opcional
      onMessageSent?.()
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error)
      // O erro já é tratado no hook useSendMessage com toast
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sem Shift = enviar
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const isDisabled = sendMessage.isPending

  return (
    <div className={cn("flex gap-2 p-4 border-t", className)}>
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={1}
        maxLength={maxLength}
        className="min-h-[40px] max-h-[200px] resize-none"
      />

      <Button
        onClick={handleSend}
        disabled={isDisabled || !content.trim()}
        size="icon"
        className="shrink-0"
      >
        {sendMessage.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
