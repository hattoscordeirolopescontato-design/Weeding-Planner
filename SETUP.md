# Setup — Casamento Sem Estresse

Guia rápido para rodar o app com Supabase (auth + banco) e Stripe (pagamento).

---

## 1. Pré-requisitos

- Node.js 20+ e npm
- Conta no [Supabase](https://supabase.com) (projeto já criado)
- Conta no [Stripe](https://stripe.com) em modo de teste
- Dependências instaladas: `npm install`

---

## 2. Variáveis de ambiente (`.env`)

O arquivo `.env` já existe na raiz (e está no `.gitignore` — **nunca suba ao GitHub**). Confira que tem:

```
NEXT_PUBLIC_SUPABASE_URL=https://krfbpbfscughhbuimmgd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...        # chave "anon public" do Supabase
SUPABASE_SERVICE_KEY=sb_secret_...                      # service role (somente servidor)

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PRICE_ID=price_...                   # preço do Plano Completo (assinatura)
STRIPE_WEBHOOK_SECRET=                                  # preencher no passo 5
```

> Observação: este projeto é **Next.js**, então as variáveis usam o prefixo `NEXT_PUBLIC_`
> (e não `VITE_`). As que **não** têm `NEXT_PUBLIC_` ficam só no servidor.

---

## 3. Banco de dados (Supabase) — **obrigatório**

Sem este passo, login/cadastro e os módulos não funcionam (as tabelas não existem).

1. Supabase → seu projeto → **SQL Editor** → **New query**.
2. Cole TODO o conteúdo de [`supabase/schema.sql`](./supabase/schema.sql).
3. Clique em **Run**.

Isso cria as tabelas (`profiles`, `subscriptions`, `fornecedores`, `local`, `convidados`,
`agenda`, `checklist`, `presentes`, `presentes_config`, `lua_de_mel`, `cerimonia`,
`cartorio`, `votos`, etc.) com **Row Level Security** — cada usuário só enxerga os
próprios dados.

---

## 4. Autenticação (Supabase) — recomendado para testar

Para conseguir logar logo após o cadastro (sem precisar confirmar e-mail):

- Supabase → **Authentication** → **Providers** → **Email** → desligar **"Confirm email"**.

Com a confirmação ligada, o usuário precisa clicar no link enviado por e-mail antes de logar.
A tela **"Esqueci minha senha"** usa o envio de e-mail do próprio Supabase.

---

## 5. Stripe (pagamento)

O fluxo de assinatura já funciona **sem** o webhook (a assinatura é ativada no retorno do
checkout). O webhook só é necessário para refletir **renovações e cancelamentos** feitos
fora do app.

**Webhook local (opcional):**

1. Instale a [Stripe CLI](https://stripe.com/docs/stripe-cli) e faça login: `stripe login`.
2. Rode:
   ```
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copie o segredo exibido (`whsec_...`) e cole em `STRIPE_WEBHOOK_SECRET` no `.env`.
4. Reinicie o `npm run dev`.

**Cartões de teste (modo teste do Stripe):**

| Cartão | Número | Resultado |
|---|---|---|
| Sucesso | `4242 4242 4242 4242` | Pagamento aprovado |
| Recusado | `4000 0000 0000 0002` | Cartão recusado |
| Exige autenticação (3DS) | `4000 0025 0000 3155` | Pede confirmação extra |

Validade: qualquer data futura · CVC: 3 dígitos quaisquer · CEP: qualquer.

---

## 6. Rodar o app

```
npm run dev
```

- Local: http://localhost:3000
- Rede (celular na mesma Wi-Fi): http://SEU-IP:3000

**Fluxo completo:**
1. Clique em **Começar agora** (vai para `/cadastro`) → informe **e-mail e senha**.
2. Você é levado para `/assinar` → **Assinar agora** → Stripe Checkout.
3. Pague com o cartão de teste `4242 4242 4242 4242`.
4. Após o pagamento, preencha os **dados do casal** (nomes e data) em `/completar-perfil`.
5. Acesse o `/dashboard` com a assinatura ativa. Pronto para usar todos os módulos.

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
| Loop entre `/login` e `/dashboard` | Sessão sem assinatura | Conclua o pagamento em `/assinar` |
| Checkout não abre | `STRIPE_SECRET_KEY`/`PRICE_ID` errados | Confira o `.env` |
| Assinatura não atualiza após cancelar no Stripe | Webhook não configurado | Faça o passo 5 |
| Dados não salvam | RLS / usuário não autenticado | Confirme login e que o SQL criou as policies |

---

## Estrutura relevante

```
src/lib/supabase/      clients (client, server, admin) + hooks (useUser, useList, useSingle)
src/lib/stripe.ts      instância do Stripe (servidor)
src/proxy.ts           proteção de rotas + bloqueio por assinatura
src/app/(auth)/        login, cadastro, recuperar-senha
src/app/assinar/       landing de assinatura
src/app/api/stripe/    checkout, success, webhook, portal
src/app/dashboard/     módulos (todos lendo/gravando no Supabase)
supabase/schema.sql    script para criar o banco
```
