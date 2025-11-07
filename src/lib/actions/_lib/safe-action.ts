import { createSafeActionClient } from "next-safe-action"
import { createServerSupabaseClient } from "@/lib/supabase/server"

/**
 * Cliente base sem autenticação
 */
export const actionClient = createSafeActionClient({
  handleServerError(e: Error) {
    return {
      serverError: e.message,
    }
  },
})

/**
 * Cliente com middleware de autenticação
 * Use este para todas as actions que precisam de usuário logado
 */
export const authActionClient = actionClient.use(async ({ next }) => {
  const supabase = await createServerSupabaseClient()

  // Verificar autenticação
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Não autenticado")
  }

  // Buscar perfil completo
  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!profile) {
    throw new Error("Perfil não encontrado")
  }

  // Passar contexto adiante
  return next({
    ctx: {
      user: profile,
      supabase,
    },
  })
})

/**
 * Cliente para Super Admin apenas
 */
export const superAdminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "super_admin") {
    throw new Error("Acesso negado: apenas Super Admin")
  }

  return next({ ctx })
})
