-- ============================================================
-- Categorias e subcategorias personalizáveis
-- ============================================================

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  name text not null,
  type text not null default 'expense' check (type in ('income','expense')),
  parent_id uuid references categories(id) on delete cascade,
  color text,
  created_at timestamptz not null default now()
);

create index if not exists idx_categories_org on categories(org_id);
create index if not exists idx_categories_parent on categories(parent_id);

-- Vincula transações a uma categoria (mantém o campo texto para compatibilidade/dashboard)
alter table transactions add column if not exists category_id uuid references categories(id) on delete set null;

-- RLS
alter table categories enable row level security;
create policy "categories_org_all" on categories
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
