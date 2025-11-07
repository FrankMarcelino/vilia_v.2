import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function SuperAdminDashboardPage() {
  const supabase = await createServerSupabaseClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (profile?.role !== "super_admin") {
    redirect("/cliente")
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Dashboard Super Admin</h1>
          <p className="text-muted-foreground mt-2">Gerenciamento completo da plataforma</p>
        </div>

        <div className="border rounded-lg p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Informações do Admin</h2>
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
          <h2 className="text-2xl font-semibold mb-4">Módulos de Gerenciamento</h2>
          <ul className="space-y-2">
            <li className="text-muted-foreground">• Gerenciar Empresas</li>
            <li className="text-muted-foreground">• Gerenciar NeuroCores</li>
            <li className="text-muted-foreground">• Gerenciar Agentes IA</li>
            <li className="text-muted-foreground">• Gerenciar Feedbacks</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
