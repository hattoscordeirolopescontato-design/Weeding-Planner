-- ============================================================================
-- Casamento Sem Estresse — schema Supabase
-- Rode este arquivo no Supabase: SQL Editor > New query > cole tudo > Run.
-- Ajustes em relação ao SQL original:
--   • local: SEM "unique" no user_id (permite comparar vários locais) + is_selected/observacoes
--   • votos: guardado CIFRADO (title + ciphertext/iv/salt/auth_tag), pode haver mais de um por usuário
-- ============================================================================

create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  nome_noivo text,
  nome_noiva text,
  data_casamento date,
  orcamento_total numeric default 0,
  created_at timestamptz default now()
);

create table if not exists subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text default 'inactive',
  current_period_end timestamptz,
  created_at timestamptz default now()
);

create table if not exists fornecedores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  nome text,
  categoria text,
  status text default 'cotacao',
  valor_total numeric default 0,
  parcelado boolean default false,
  num_parcelas integer default 1,
  valor_parcela numeric default 0,
  parcelas_pagas integer default 0,
  data_proxima_parcela date,
  contato text,
  observacoes text,
  comprovantes jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists local (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  tipo text,
  nome text,
  endereco text,
  convidados_total integer default 0,
  convidados_inteira integer default 0,
  convidados_meia integer default 0,
  convidados_nao_pagantes integer default 0,
  valor_inteira numeric default 0,
  valor_meia numeric default 0,
  taxa_percentual numeric default 0,
  servicos_adicionais jsonb default '[]',
  is_selected boolean default false,
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists convidados (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  nome text,
  email text,
  telefone text,
  grupo text,
  status text default 'pendente',
  tipo_pagamento text default 'inteira',
  acompanhantes integer default 0,
  mesa text,
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists padrinhos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  nome text,
  papel text,
  telefone text,
  email text,
  status text default 'pendente',
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists agenda (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  titulo text,
  data date,
  horario time,
  descricao text,
  tipo text,
  responsavel text default 'ambos',
  created_at timestamptz default now()
);

create table if not exists checklist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  titulo text,
  categoria text,
  responsavel text default 'ambos',
  concluido boolean default false,
  custom boolean default false,
  created_at timestamptz default now()
);

create table if not exists presentes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  nome text,
  categoria text,
  loja text,
  link text,
  valor numeric default 0,
  prioridade text default 'media',
  status text default 'disponivel',
  quem_presenteou text,
  created_at timestamptz default now()
);

-- chave Pix do casal (1 por usuário)
create table if not exists presentes_config (
  user_id uuid references auth.users on delete cascade primary key,
  pix_key text,
  created_at timestamptz default now()
);

create table if not exists lua_de_mel (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  destino text,
  destino_alternativo text,
  data_ida date,
  data_volta date,
  orcamento numeric default 0,
  hospedagem jsonb default '[]',
  passagens jsonb default '[]',
  roteiro jsonb default '[]',
  checklist jsonb default '[]',
  created_at timestamptz default now()
);

create table if not exists cerimonia (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  tipo text,
  celebrante text,
  contato_celebrante text,
  duracao text,
  roteiro jsonb default '[]',
  musicas jsonb default '[]',
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists cartorio (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  nome text,
  endereco text,
  contato text,
  data_habilitacao date,
  data_cerimonia_civil date,
  documentos jsonb default '[]',
  testemunhas jsonb default '[]',
  pacto boolean default false,
  observacoes text,
  created_at timestamptz default now()
);

create table if not exists dress_code (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade unique,
  padrinhos jsonb default '{}',
  madrinhas jsonb default '{}',
  convidados_geral text,
  created_at timestamptz default now()
);

-- votos CIFRADOS (texto nunca é salvo em claro). Pode haver mais de um por usuário.
create table if not exists votos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  titulo text default 'Meus votos',
  ciphertext text,
  iv text,
  salt text,
  auth_tag text,
  created_at timestamptz default now()
);

-- pedidos do checkout transparente (Pagar.me). Inserts/updates só pelo
-- backend (service role) — RLS abaixo só libera SELECT para o dono.
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

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table profiles enable row level security;
alter table subscriptions enable row level security;
alter table fornecedores enable row level security;
alter table local enable row level security;
alter table convidados enable row level security;
alter table padrinhos enable row level security;
alter table agenda enable row level security;
alter table checklist enable row level security;
alter table presentes enable row level security;
alter table presentes_config enable row level security;
alter table lua_de_mel enable row level security;
alter table cerimonia enable row level security;
alter table cartorio enable row level security;
alter table dress_code enable row level security;
alter table votos enable row level security;
alter table pedidos_pagarme enable row level security;

create policy "own profile" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "own subscription" on subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own fornecedores" on fornecedores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own local" on local for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own convidados" on convidados for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own padrinhos" on padrinhos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own agenda" on agenda for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own checklist" on checklist for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own presentes" on presentes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own presentes_config" on presentes_config for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own lua_de_mel" on lua_de_mel for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cerimonia" on cerimonia for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own cartorio" on cartorio for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own dress_code" on dress_code for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own votos" on votos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "select own pedidos_pagarme" on pedidos_pagarme for select using (auth.uid() = user_id);
