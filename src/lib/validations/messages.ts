import { z } from "zod"

/**
 * Schema para enviar mensagem
 */
export const sendMessageSchema = z.object({
  conversationId: z.string().uuid({ message: "ID da conversa inválido" }),
  content: z
    .string()
    .min(1, { message: "Mensagem não pode estar vazia" })
    .max(5000, { message: "Mensagem muito longa (máximo 5000 caracteres)" }),
  mediaUrl: z.string().url({ message: "URL de mídia inválida" }).optional(),
  mediaType: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>

/**
 * Schema para atualizar mensagem
 */
export const updateMessageSchema = z.object({
  id: z.string().uuid({ message: "ID da mensagem inválido" }),
  content: z.string().min(1).max(5000, { message: "Mensagem muito longa" }).optional(),
  isRead: z.boolean().optional(),
})

export type UpdateMessageInput = z.infer<typeof updateMessageSchema>

/**
 * Schema para marcar mensagens como lidas
 */
export const markMessagesAsReadSchema = z.object({
  conversationId: z.string().uuid({ message: "ID da conversa inválido" }),
  messageIds: z.array(z.string().uuid({ message: "ID inválido" })).optional(),
})

export type MarkMessagesAsReadInput = z.infer<typeof markMessagesAsReadSchema>

/**
 * Schema para buscar mensagens
 */
export const fetchMessagesSchema = z.object({
  conversationId: z.string().uuid({ message: "ID da conversa inválido" }),
  limit: z
    .number()
    .int()
    .positive()
    .max(100, { message: "Limite máximo é 100" })
    .optional()
    .default(50),
  offset: z.number().int().nonnegative().optional().default(0),
})

export type FetchMessagesInput = z.infer<typeof fetchMessagesSchema>
