# 💍 Wedding Planner — Planejamento de Casamento

Plataforma multi-casais (SaaS) para organizar o casamento: fornecedores, local,
cerimônia, convidados, agenda, checklist, cartório, lua de mel, presentes e votos
secretos protegidos por senha.

## Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS 4**
- **Supabase** — banco **Postgres gerenciado** + **Auth** + **RLS** (Row Level Security),
  acessado direto pelo client JS (`@supabase/ssr` e `@supabase/supabase-js`)
- **Autenticação: Supabase Auth** — e-mail/senha; sessão em cookies gerida pelo
  middleware `proxy.ts`
- **Pagamento**: nenhum processador ativo no momento (o acesso está liberado sem
  cobrança). Integração com **Pagar.me** planejada para depois.
- **Votos cifrados em repouso**: AES-256-GCM com chave derivada da senha (via `node:crypto`)

## Como rodar

```bash
npm install
# crie o .env com as chaves do Supabase/Stripe (veja SETUP.md)
copy .env.example .env
npm run dev              # http://localhost:3000
```

O banco vive no Supabase. Para criar as tabelas, rode o conteúdo de
[`supabase/schema.sql`](./supabase/schema.sql) no **SQL Editor** do seu projeto
Supabase. Passo a passo completo em [`SETUP.md`](./SETUP.md).

Variáveis de ambiente (Next.js — prefixo `NEXT_PUBLIC_` para as expostas ao browser):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # chave publishable do Supabase
SUPABASE_SERVICE_KEY=              # chave secret (somente servidor)
```

> Pagamento ainda não configurado — não há variáveis de processador de pagamento
> no momento (Pagar.me será adicionado depois).

## Estrutura

```
src/
  app/
    login | (auth)/cadastro | (auth)/recuperar-senha   # autenticação (Supabase)
    completar-perfil/            # dados do casal após cadastro
    assinar/                     # tela "assinatura em breve" (pagamento desativado)
    dashboard/
      page.tsx + overview-client # visão geral (indicadores + contagem regressiva)
      vendors | venues | ceremony | guests | agenda | checklist
      cartorio | honeymoon | gifts | vows | settings     # módulos (CRUD no Supabase)
  components/                    # UI reutilizável (inputs, botões, nav, countdown)
  lib/
    supabase/                    # clients (client, server, admin) + hooks
    vows-crypto.ts               # cifragem AES-256-GCM dos votos (node:crypto)
    finance.ts | format.ts | validation.ts | ...        # utilidades
  proxy.ts                       # middleware do Next 16 (renova sessão + protege rotas)
supabase/
  schema.sql                     # cria tabelas + RLS no Postgres do Supabase
  alter_convidados_tipo_pagamento.sql
```

## Modelo de dados

Tabelas no Postgres do Supabase, todas com **RLS** por `user_id` (cada casal só
enxerga os próprios dados): `profiles`, `fornecedores`, `local`, `convidados`,
`agenda`, `checklist`, `cerimonia`, `cartorio`, `lua_de_mel`, `presentes`,
`votos`, entre outras. Os `votos` guardam apenas o texto cifrado (AES-256-GCM).

## Deploy

Pensado para a **Vercel** (o Supabase é externo e persistente, então funciona bem
em serverless). Configure as variáveis de ambiente acima no projeto da Vercel.

## Próximos passos (ideias)

- Página pública para convidados confirmarem presença (RSVP)
- Convite do(a) parceiro(a) para o mesmo casamento
- Upload de fotos e inspirações; exportar lista de convidados
- Ativar o fluxo de pagamento (Stripe) no cadastro
