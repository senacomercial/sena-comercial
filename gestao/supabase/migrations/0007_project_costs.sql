-- ============================================================
-- Cost allocation: link expenses to projects for profitability tracking
-- ============================================================

-- Alocar custos (transactions do tipo expense) a um projeto com amount alocado
create table if not exists project_costs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  project_id uuid not null references projects(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  amount numeric(14,2) not null,
  created_at timestamptz not null default now(),

  -- Uma transação pode ser alocada múltiplas vezes em múltiplos projetos
  -- Não há unicidade forçada aqui propositalmente
  unique(project_id, transaction_id, id)
);

-- Índices para performance
create index if not exists idx_project_costs_project on project_costs(project_id);
create index if not exists idx_project_costs_transaction on project_costs(transaction_id);
create index if not exists idx_project_costs_org on project_costs(org_id);

-- RLS: usuários só veem custos de projetos na sua organização
alter table project_costs enable row level security;

create policy "org_isolation" on project_costs
  for all using (org_id = auth.uid()::uuid or exists (
    select 1 from org_members m
    where m.org_id = project_costs.org_id and m.user_id = auth.uid()
  ));

-- Adicionar campo category_id na transactions (se não existir ainda)
alter table transactions add column if not exists category_id uuid references categories(id) on delete set null;

-- Índice para filtrar transactions por categoria
create index if not exists idx_transactions_category on transactions(category_id);
