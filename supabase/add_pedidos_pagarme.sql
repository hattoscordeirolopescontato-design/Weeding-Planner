-- Rode no Supabase (SQL Editor) para criar a tabela de pedidos do checkout
-- transparente com a Pagar.me. Inserts/updates só acontecem pelo backend
-- (service role via createSupabaseAdmin()) — por isso a política de RLS
-- abaixo só libera SELECT para o dono da linha.
create table if not exists pedidos_pagarme (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  pagarme_order_id text unique,
  pagarme_card_id text,
  status text not null default 'pending',
  valor numeric not null,
  raw_response jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table pedidos_pagarme enable row level security;

create policy "select own pedidos_pagarme" on pedidos_pagarme
  for select using (auth.uid() = user_id);
