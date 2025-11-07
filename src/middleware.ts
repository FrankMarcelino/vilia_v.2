import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.pathname

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Rotas públicas
  const publicRoutes = ["/"]
  const authRoutes = ["/login", "/signup"]

  if (publicRoutes.includes(url)) {
    if (url === "/" && session?.user) {
      const userProfile = await fetchUserProfile(session.user.id, supabase)
      if (userProfile && userProfile.is_active) {
        const dashboardPath = userProfile.role === "super_admin" ? "/super-admin" : "/cliente"
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    }
    return response
  }

  // Rotas de autenticação
  if (authRoutes.includes(url)) {
    if (session?.user) {
      const userProfile = await fetchUserProfile(session.user.id, supabase)
      if (userProfile && userProfile.is_active) {
        const dashboardPath = userProfile.role === "super_admin" ? "/super-admin" : "/cliente"
        return NextResponse.redirect(new URL(dashboardPath, request.url))
      }
    }
    return response
  }

  // Rotas protegidas
  if (url.startsWith("/cliente") || url.startsWith("/super-admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    const userProfile = await fetchUserProfile(session.user.id, supabase)

    if (!userProfile) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (!userProfile.is_active) {
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verificar permissões baseadas em role
    if (url.startsWith("/super-admin") && userProfile.role !== "super_admin") {
      return NextResponse.redirect(new URL("/cliente", request.url))
    }

    if (url.startsWith("/cliente") && userProfile.role !== "usuario_cliente") {
      return NextResponse.redirect(new URL("/super-admin", request.url))
    }

    return response
  }

  return response
}

async function fetchUserProfile(
  userId: string,
  supabase: {
    from: (table: string) => {
      select: (columns: string) => {
        eq: (
          column: string,
          value: string
        ) => {
          single: () => Promise<{ data: unknown; error: unknown }>
        }
      }
    }
  }
) {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("id, role, is_active, tenant_id")
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Middleware - Erro ao buscar perfil:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Middleware - Exceção ao buscar perfil:", error)
    return null
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
