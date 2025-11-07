"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from "react"
import { useRouter } from "next/navigation"
import { User, UserRole } from "@/types"
import { createBrowserClient } from "@/lib/supabase/client"
import type { AuthError } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoadingAuth: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Função para buscar perfil completo do usuário
  const fetchUserProfile = useCallback(
    async (userId: string): Promise<User | null> => {
      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", userId).single()

        if (error) {
          console.error("Erro ao buscar perfil do usuário:", error)
          return null
        }

        if (!data) {
          console.warn("Perfil do usuário não encontrado na tabela public.users")
          return null
        }

        return {
          id: data.id,
          tenantId: data.tenant_id || null,
          fullName: data.full_name || data.email,
          email: data.email,
          whatsappNumber: data.whatsapp_number || "",
          role: data.role as UserRole,
          avatarUrl: data.avatar_url || "",
          modules: data.modules || [],
          isActive: data.is_active ?? true,
          lastSignInAt: data.last_sign_in_at || null,
          createdAt: data.created_at || new Date().toISOString(),
        }
      } catch (error) {
        console.error("Exceção ao buscar perfil do usuário:", error)
        return null
      }
    },
    [supabase]
  )

  // Função para redirecionar baseado na role do usuário
  const redirectByRole = useCallback(
    (userRole: UserRole) => {
      const targetPath = userRole === UserRole.SUPER_ADMIN ? "/super-admin" : "/cliente"
      router.replace(targetPath)
    },
    [router]
  )

  // Escutar mudanças de autenticação
  useEffect(() => {
    let isMounted = true

    // Timeout de segurança
    loadingTimeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.warn("Timeout de segurança: desativando loading após 3 segundos")
        setIsLoadingAuth(false)
      }
    }, 3000)

    // Verificar sessão inicial
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError)
          if (isMounted) {
            setUser(null)
            setIsLoadingAuth(false)
          }
          return
        }

        if (session?.user) {
          const userProfile = await fetchUserProfile(session.user.id)
          if (isMounted) {
            if (!userProfile) {
              console.error("Perfil do usuário não encontrado na sessão inicial")
              setUser(null)
              setIsLoadingAuth(false)
              return
            }

            if (!userProfile.isActive) {
              console.warn("Usuário inativo na sessão inicial")
              await supabase.auth.signOut()
              setUser(null)
              setIsLoadingAuth(false)
              return
            }

            setUser(userProfile)

            // Redirecionar se estiver em página de auth
            if (typeof window !== "undefined") {
              const currentPath = window.location.pathname
              if (currentPath === "/login" || currentPath === "/signup") {
                redirectByRole(userProfile.role)
              }
            }
          }
        } else {
          if (isMounted) {
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error)
        if (isMounted) {
          setUser(null)
        }
      } finally {
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
        if (isMounted) {
          setIsLoadingAuth(false)
        }
      }
    }

    checkSession()

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      if (event === "SIGNED_IN" && session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        if (isMounted) {
          if (!userProfile) {
            console.error("Perfil do usuário não encontrado após login")
            await supabase.auth.signOut()
            setUser(null)
            router.replace("/login")
            return
          }

          if (!userProfile.isActive) {
            console.warn("Usuário inativo tentando fazer login")
            await supabase.auth.signOut()
            setUser(null)
            router.replace("/login")
            return
          }

          setUser(userProfile)
          redirectByRole(userProfile.role)
        }
      } else if (event === "SIGNED_OUT") {
        if (isMounted) {
          setUser(null)
          router.replace("/login")
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        if (isMounted) {
          if (!userProfile || !userProfile.isActive) {
            console.warn("Usuário sem perfil ou inativo durante refresh do token")
            await supabase.auth.signOut()
            setUser(null)
            router.replace("/login")
            return
          }
          setUser(userProfile)
        }
      }

      if (isMounted) {
        setIsLoadingAuth(false)
      }
    })

    return () => {
      isMounted = false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserProfile, router, redirectByRole])

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          throw error
        }

        // Verificar perfil após login
        if (data?.user) {
          const userProfile = await fetchUserProfile(data.user.id)

          if (!userProfile) {
            await supabase.auth.signOut()
            throw new Error("Perfil do usuário não encontrado. Entre em contato com o suporte.")
          }

          if (!userProfile.isActive) {
            await supabase.auth.signOut()
            throw new Error("Sua conta está inativa. Entre em contato com o administrador.")
          }
        }
      } catch (error) {
        const authError = error as AuthError
        if (error instanceof Error) {
          throw error
        }
        throw new Error(authError.message || "Erro ao fazer login")
      }
    },
    [supabase, fetchUserProfile]
  )

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) {
          throw error
        }
      } catch (error) {
        const authError = error as AuthError
        throw new Error(authError.message || "Erro ao criar conta")
      }
    },
    [supabase]
  )

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }
    } catch (error) {
      const authError = error as AuthError
      throw new Error(authError.message || "Erro ao fazer logout")
    }
  }, [supabase])

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session?.user) {
        const userProfile = await fetchUserProfile(session.user.id)
        if (userProfile) {
          setUser(userProfile)
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil do usuário:", error)
    }
  }, [supabase, fetchUserProfile])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoadingAuth,
        signIn,
        signUp,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return context
}
