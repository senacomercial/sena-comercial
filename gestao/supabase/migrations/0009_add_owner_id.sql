-- ============================================================
-- Fix: adicionar owner_id em tabelas que faltavam
-- O hook useCollection sempre insere owner_id, então a coluna precisa existir.
-- ============================================================

alter table project_costs add column if not exists owner_id uuid references auth.users(id);
alter table crm_stages add column if not exists owner_id uuid references auth.users(id);
