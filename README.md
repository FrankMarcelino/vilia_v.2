# Lívia v2 🤖

Plataforma de atendimento ao cliente com IA - Arquitetura moderna e escalável

## Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **State:** React Query + Context API
- **Realtime:** Supabase Realtime
- **Forms:** React Hook Form + Zod
- **Server Actions:** next-safe-action

## Estrutura do Projeto

```
src/
├── app/              # Next.js App Router
│   ├── (auth)/      # Rotas públicas (login, signup)
│   ├── (dashboard)/ # Rotas protegidas (cliente, super-admin)
│   └── api/         # API Routes
├── features/         # Features compartilhadas entre páginas
│   ├── auth/        # Autenticação
│   ├── messages/    # Mensagens (com realtime)
│   ├── conversations/ # Conversas (com realtime)
│   └── contacts/    # Contatos
├── components/       # Componentes UI globais
│   ├── ui/          # Shadcn/ui components
│   └── shared/      # Componentes compartilhados
├── lib/             # Utilities e configurações
│   ├── supabase/    # Supabase clients
│   ├── react-query/ # React Query setup
│   ├── validations/ # Zod schemas
│   ├── actions/     # Server Actions
│   └── utils/       # Utilities
├── hooks/           # Custom React hooks globais
├── types/           # TypeScript types e interfaces
├── contexts/        # React Contexts (apenas UI state)
└── middleware.ts    # Next.js middleware
```

## Getting Started

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

```bash
cp .env.example .env.local
```

Preencha com suas credenciais do Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-key-aqui
```

### 3. Configurar Supabase

1. Crie um projeto no [Supabase Dashboard](https://app.supabase.com)
2. Execute as migrations do projeto antigo
3. Configure RLS policies
4. Gere tipos TypeScript: `npx supabase gen types typescript --local > src/lib/supabase/types.ts`

### 4. Rodar em Desenvolvimento

```bash
npm run dev
```

Acesse: `http://localhost:3000`

## Regras de Desenvolvimento

Leia [.cursorrules](./.cursorrules) para regras completas.

### Quick Reference

- **Nomenclatura:** kebab-case (arquivos), PascalCase (componentes), camelCase (funções)
- **Commits:** Conventional Commits obrigatório
- **Types:** Strict mode, evitar `any`
- **Components:** Max 200 linhas, Single Responsibility
- **Hooks:** Colocation em `_features/`, shared em `/features`

## Comandos

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint
npm run lint:fix     # ESLint com fix automático
npm run format       # Prettier
npm run format:check # Verificar formatação
npm run type-check   # TypeScript check
npm run test         # Run tests
npm run test:watch   # Watch mode
```

## Arquitetura

### Princípios

1. **Colocation por Feature**: Tudo relacionado a uma feature fica junto
2. **Shared Code em `/features`**: Features usadas em múltiplas páginas
3. **`_features` vs `_components`**: Features têm lógica, components são "burros"
4. **Não Duplicar Hooks**: Data hooks em `/features`, UI hooks locais
5. **API Layer Isolada**: Toda comunicação com Supabase em `features/[entity]/api/`

### State Management

- **Server State**: React Query (dados do banco, cache automático)
- **UI State**: Context API (apenas auth e theme)
- **Realtime**: Supabase Realtime + React Query cache updates

### Server Actions

Sempre use `next-safe-action` com middleware de autenticação:

```typescript
import { authActionClient } from "@/lib/actions/_lib/safe-action"

export const myAction = authActionClient.schema(mySchema).action(async ({ parsedInput, ctx }) => {
  // ctx.user e ctx.supabase disponíveis
})
```

### Realtime

Sempre limpe subscriptions no cleanup:

```typescript
useEffect(() => {
  const channel = supabase
    .channel("my-channel")
    .on("postgres_changes", {}, (payload) => {
      // atualizar cache do React Query
    })
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
```

## Deployment

Deploy automático no Vercel ao fazer push para `main`:

1. Conecte o repositório no Vercel
2. Configure as variáveis de ambiente
3. Deploy!

## License

Private

---

**Versão**: 2.0  
**Status**: 🚀 Em desenvolvimento
