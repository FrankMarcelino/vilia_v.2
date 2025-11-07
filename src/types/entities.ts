// Domain Types - Entidades do domínio

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  USUARIO_CLIENTE = "usuario_cliente",
}

export enum MessageSenderType {
  CUSTOMER = "customer",
  ATENDENTE = "atendente",
  IA = "ia",
}

export enum ConversationStatus {
  CONVERSANDO = "Conversando",
  PAUSADA = "Pausada",
  ENCERRADA = "Encerrada",
}

export enum ContactStatus {
  ABERTO = "Aberto",
  COM_IA = "Com IA",
  PAUSADA = "Pausada",
  ENCERRADA = "Encerrada",
}

export enum FeedbackType {
  LIKE = "like",
  DISLIKE = "dislike",
}

export interface User {
  id: string
  tenantId: string | null
  fullName: string
  email: string
  whatsappNumber: string
  role: UserRole
  avatarUrl: string
  modules: string[]
  isActive: boolean
  lastSignInAt: string | null
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderType: MessageSenderType
  senderId: string | null
  content: string
  timestamp: string
  feedback: MessageFeedback | null
}

export interface MessageFeedback {
  type: FeedbackType
  text: string | null
}

export interface Conversation {
  id: string
  contactId: string
  tenantId: string
  status: ConversationStatus
  iaActive: boolean
  lastMessageAt: string
  overallFeedback: ConversationFeedback | null
  createdAt: string
}

export interface ConversationFeedback {
  type: FeedbackType
  text: string | null
}

export interface Contact {
  id: string
  tenantId: string
  name: string
  phone: string
  phoneSecondary: string | null
  email: string | null
  country: string | null
  city: string | null
  zipCode: string | null
  addressStreet: string | null
  addressNumber: string | null
  addressComplement: string | null
  cpf: string | null
  rg: string | null
  lastInteraction: string
  status: ContactStatus
  customerDataExtracted: Record<string, string> | null
  tags: string[] | null
  lastNegotiation: Record<string, unknown> | null
  createdAt: string
}

export interface Tenant {
  id: string
  name: string
  neurocoreId: string
  isActive: boolean
  cnpj: string
  phone: string
  plan: string
  createdAt: string
}
