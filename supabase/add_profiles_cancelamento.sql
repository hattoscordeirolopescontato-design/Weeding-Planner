-- Rode no Supabase (SQL Editor). Cancelamento self-service: a pessoa
-- cancela pelo próprio site (Configurações > Assinatura), a conta e os
-- dados continuam existindo, só fica travada para edição (ver
-- src/app/dashboard/layout.tsx). Exclusão de conta continua exigindo
-- contato com o suporte.
alter table profiles add column if not exists assinatura_cancelada_em timestamptz;
