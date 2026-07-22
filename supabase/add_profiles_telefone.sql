-- Rode no Supabase (SQL Editor). O cadastro (/cadastro) agora coleta
-- telefone junto com CPF, para permitir só uma conta por CPF logo na
-- criação da conta (evita trial de 7 dias infinito com contas descartáveis).
alter table profiles add column if not exists telefone text;
