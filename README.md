# 💍 NósCasamos — Planejamento de Casamento

Plataforma multi-casais (SaaS) para organizar o casamento: fornecedores, local,
convidados e votos secretos protegidos por senha.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS 4**
- **Prisma 7** + **SQLite** (via driver adapter `better-sqlite3`) em desenvolvimento
- **Autenticação própria**: sessão JWT (`jose`) em cookie `httpOnly` + Data Access Layer
- **Votos cifrados em repouso**: AES-256-GCM com chave derivada da senha (scrypt)

## Como rodar

```bash
npm install
# crie o .env a partir do exemplo e gere um SESSION_SECRET
copy .env.example .env
npx prisma migrate dev   # cria o banco e aplica as migrações
npm run dev              # http://localhost:3000
```

## Estrutura

```
src/
  app/
    (auth)/login | register      # páginas de autenticação
    actions/auth.ts | wedding.ts # server actions de conta e casamento
    onboarding/                  # criação do primeiro casamento
    dashboard/
      page.tsx                   # visão geral (indicadores)
      vendors | venues | guests  # CRUD de planejamento (page + form + actions)
      vows/                      # votos cifrados (page + form + card)
      settings/                  # dados do casamento e conta
  components/                    # UI reutilizável (inputs, botão, nav)
  lib/
    prisma.ts                    # client Prisma (singleton + adapter)
    session.ts                   # criar/ler/apagar sessão (JWT)
    dal.ts                       # verifySession, getCurrentUser, getActiveWedding
    vows-crypto.ts               # cifragem AES-256-GCM dos votos
    validation.ts                # schemas zod + estado de formulário
  proxy.ts                       # proteção de rotas (novo "middleware" do Next 16)
prisma/
  schema.prisma                  # modelos: User, Wedding, Vendor, Venue, Guest, Vow
  migrations/
```

## Modelo de dados

`User` ⇄ `WeddingMember` ⇄ `Wedding` (N:N — permite os dois noivos no mesmo
casamento). Cada `Wedding` tem `Vendor`, `Venue`, `Guest` e `Vow`. Cada `Vow`
pertence a um autor e guarda apenas o texto cifrado.

## Próximos passos (ideias)

- Página pública para convidados confirmarem presença (RSVP)
- Convite do(a) parceiro(a) para o mesmo casamento
- Checklist/cronograma de tarefas e controle de orçamento detalhado
- Upload de fotos e inspirações; exportar lista de convidados
- Migrar para PostgreSQL (Neon/Supabase) e deploy na Vercel
```
