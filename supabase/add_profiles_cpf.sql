-- Rode no Supabase (SQL Editor). O checkout (/api/checkout) grava nome
-- completo e CPF em "profiles" — essa é a etapa que funciona como cadastro
-- da pessoa. O unique em cpf garante uma conta por CPF.
alter table profiles add column if not exists nome_completo text;
alter table profiles add column if not exists cpf text unique;
