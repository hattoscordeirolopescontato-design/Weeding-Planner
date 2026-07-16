# Setup — Wedding Planner

Guia rápido para rodar o app com Supabase (auth + banco).

> Pagamento ainda não está configurado — não há processador ativo no momento. O app
> funciona com **acesso liberado** (a integração com o Pagar.me virá depois).

---

## 1. Pré-requisitos

- Node.js 20+ e npm
- Conta no [Supabase](https://supabase.com) (projeto já criado)
- Dependências instaladas: `npm install`

---

## 2. Variáveis de ambiente (`.env`)

O arquivo `.env` fica na raiz (e está no `.gitignore` — **nunca suba ao GitHub**). Confira que tem:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...        # chave publishable do Supabase
SUPABASE_SERVICE_KEY=sb_secret_...                      # chave secret (só servidor) — opcional
```

- As duas primeiras (`NEXT_PUBLIC_*`) são **obrigatórias** e vão para o navegador — quem protege os dados é o RLS.
- `SUPABASE_SERVICE_KEY` é secreta (só servidor) e **atualmente não é usada** por nenhuma parte do app; pode deixar de fora se quiser.

> Observação: este projeto é **Next.js**, então as variáveis usam o prefixo `NEXT_PUBLIC_`
> (e não `VITE_`). As que **não** têm `NEXT_PUBLIC_` ficam só no servidor.
>
> Onde pegar os valores: Supabase → **Project Settings → API** (Project URL) e **API keys**
> (chaves publishable/secret).

---

## 3. Banco de dados (Supabase) — **obrigatório**

Sem este passo, login/cadastro e os módulos não funcionam (as tabelas não existem).

1. Supabase → seu projeto → **SQL Editor** → **New query**.
2. Cole TODO o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. Clique em **Run**.
4. Se a tabela `convidados` já existia de antes, rode também
   [`supabase/alter_convidados_tipo_pagamento.sql`](./supabase/alter_convidados_tipo_pagamento.sql).

Isso cria as tabelas (`profiles`, `fornecedores`, `local`, `convidados`, `agenda`,
`checklist`, `presentes`, `presentes_config`, `lua_de_mel`, `cerimonia`, `cartorio`,
`votos`, etc.) com **Row Level Security** — cada usuário só enxerga os próprios dados.

---

## 4. Autenticação (Supabase)

**E-mail/senha (recomendado para testar):** para logar logo após o cadastro sem confirmar e-mail:

- Supabase → **Authentication** → **Providers** → **Email** → desligar **"Confirm email"**.

Com a confirmação ligada, o usuário precisa clicar no link enviado por e-mail antes de logar.
A tela **"Esqueci minha senha"** usa o envio de e-mail do próprio Supabase.

O login é somente **e-mail/senha** — não há OAuth (Google) configurado.

---

## 5. Pagamento

Não há processador de pagamento ativo. As telas de assinatura mostram **"em breve"** e o
acesso ao app fica **liberado** para todos os usuários. A integração com o **Pagar.me** será
feita futuramente. Nenhuma variável de ambiente de pagamento é necessária.

---

## 6. Rodar o app

```
npm run dev
```

- Local: http://localhost:3000
- Rede (celular na mesma Wi-Fi): http://SEU-IP:3000

**Fluxo completo:**
1. Clique em **Começar agora** / **Criar conta** (vai para `/cadastro`) → informe **e-mail e senha**.
2. Preencha os **dados do casal** (nomes e data) em `/completar-perfil`.
3. Acesse o `/dashboard` e use todos os módulos. Nenhum pagamento é exigido.

---

## 7. Build de produção

```
npm run build
npm run start
```

---

## 8. Solução de problemas

| Sintoma | Causa provável | Solução |
|---|---|---|
| Erro ao logar/cadastrar | SQL não rodado | Rode `supabase/schema.sql` (passo 3) |
| "Email not confirmed" | Confirmação de e-mail ligada | Desligue em Auth → Providers → Email (passo 4) |
| Coluna `tipo_pagamento` não existe | ALTER não rodado | Rode `supabase/alter_convidados_tipo_pagamento.sql` (passo 3) |
| Dados não salvam | RLS / usuário não autenticado | Confirme login e que o SQL criou as policies |

---

## 9. APIs e integrações

A **única integração externa é o Supabase** (auth + banco), consumido direto pelos SDKs
`@supabase/supabase-js` e `@supabase/ssr`. Não há API REST própria do app. **Não há API de
pagamento ativa** (Stripe removido; Pagar.me será integrado depois).

### Clients Supabase (`src/lib/supabase/`)
| Client | Função | Chave | Uso |
|---|---|---|---|
| `client.ts` | `createBrowserClient(url, key)` | publishable | componentes client |
| `server.ts` | `createServerClient(url, key, { cookies })` | publishable | Server Components / Route Handlers / middleware |
| `admin.ts` | `createClient(url, key)` (ignora RLS) | **secret** | **órfão** — sem uso atual |

### Supabase Auth API (métodos usados)
| Método | Onde | Para quê |
|---|---|---|
| `auth.signUp({ email, password })` | `(auth)/cadastro` | cadastro e-mail/senha |
| `auth.signInWithPassword({ email, password })` | `login` | login e-mail/senha |
| `auth.getUser()` | server e client | usuário autenticado atual |
| `auth.resetPasswordForEmail(email, { redirectTo })` | `recuperar-senha` | recuperação de senha |
| `auth.signOut()` | `logout-button` | logout |

### Supabase Data API (PostgREST via `supabase.from(table)…`)
CRUD sempre filtrado por **RLS** (`auth.uid() = user_id`). Padrões usados:
- `.select("*" | "campos")`, `.eq(...)`, `.order(...)`, `.maybeSingle()`, `.single()`
- `.insert(row | rows[])` — sempre injetando `user_id` (inclui insert **em lote** na importação CSV)
- `.update(values).eq("id", id)`
- `.upsert(payload, { onConflict: "user_id" })` — tabelas "single" (uma linha por usuário)
- `.delete().eq("id", id)`

Encapsulado nos hooks `useUser` / `useList` / `useSingle` (`src/lib/supabase/hooks.ts`).

### Variáveis de ambiente por integração
| Variável | Integração | Pública? | Obrigatória? |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | sim | sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase (publishable) | sim | sim |
| `SUPABASE_SERVICE_KEY` | Supabase (secret) | não | não (sem uso atual) |

---

## Estrutura relevante

```
src/lib/supabase/      clients (client, server, admin) + hooks (useUser, useList, useSingle)
src/proxy.ts           middleware do Next 16 — renova sessão + protege rotas (sem gate de pagamento)
src/app/(auth)/        cadastro, recuperar-senha
src/app/login/         login (e-mail/senha)
src/app/assinar/       tela "assinatura em breve" (pagamento desativado)
src/app/dashboard/     módulos (todos lendo/gravando no Supabase)
supabase/schema.sql    script para criar o banco + RLS
```
