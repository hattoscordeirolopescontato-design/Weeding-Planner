-- Rode no Supabase (SQL Editor) se você JÁ tinha criado a tabela "convidados"
-- antes desta atualização. Adiciona o campo de tipo de pagamento por convidado.
alter table convidados
  add column if not exists tipo_pagamento text default 'inteira';
