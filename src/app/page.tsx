import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold">Lívia v2</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Plataforma moderna de atendimento ao cliente com inteligência artificial
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/login">Fazer Login</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/signup">Criar Conta</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
