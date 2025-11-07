import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function ClienteDashboardPage() {
  const supabase = createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Cliente</h1>
          <p className="text-muted-foreground mt-2">Bem-vindo à plataforma Lívia</p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Informações do Usuário</h2>
          <div className="grid gap-4">
            <div>
              <span className="font-medium">Nome:</span>{" "}
              <span className="text-muted-foreground">{profile?.full_name}</span>
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              <span className="text-muted-foreground">{profile?.email}</span>
            </div>
            <div>
              <span className="font-medium">Role:</span>{" "}
              <span className="text-muted-foreground">{profile?.role}</span>
            </div>
          </div>
        </div>

        <div className="border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Módulos Disponíveis</h2>
          <ul className="space-y-2">
            <li className="text-muted-foreground">• Live Chat</li>
            <li className="text-muted-foreground">• Base de Conhecimento</li>
            <li className="text-muted-foreground">• Personalização</li>
            <li className="text-muted-foreground">• Treinamento</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
