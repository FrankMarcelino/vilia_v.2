import { PostgrestError } from "@supabase/supabase-js"

/**
 * Classe de erro customizada da aplicação
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode: number = 500,
    public userMessage?: string
  ) {
    super(message)
    this.name = "AppError"
  }
}

/**
 * Mapeia erros do Supabase para AppError
 */
export function handleSupabaseError(error: PostgrestError): AppError {
  // Erro de registro duplicado
  if (error.code === "23505") {
    return new AppError(error.message, "DUPLICATE", 409, "Este registro já existe")
  }

  // Erro de chave estrangeira inválida
  if (error.code === "23503") {
    return new AppError(error.message, "INVALID_REF", 400, "Referência inválida")
  }

  // Erro de violação de NOT NULL
  if (error.code === "23502") {
    return new AppError(error.message, "MISSING_FIELD", 400, "Campo obrigatório não preenchido")
  }

  // Erro genérico
  return new AppError(error.message, error.code, 500, "Erro ao processar sua solicitação")
}

/**
 * Formata erro para exibição ao usuário
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.userMessage || error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return "Erro desconhecido. Tente novamente."
}

/**
 * Log de erro (em produção, enviar para serviço de monitoramento)
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", error)
    if (context) console.error("Context:", context)
  } else {
    // TODO: Enviar para Sentry, LogRocket, etc.
  }
}
