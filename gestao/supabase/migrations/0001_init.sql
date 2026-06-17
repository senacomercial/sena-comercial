-- ============================================================
-- SENA COMERCIAL · Gestão — schema inicial
-- Multi-usuário com isolamento por organização (RLS).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Núcleo de acesso ----------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists org_members (
  org_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner','admin','member')),
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- Helper: o usuário atual pertence à organização? (SECURITY DEFINER evita recursão de RLS)
create or replace function public.is_org_member(_org_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from org_members m
    where m.org_id = _org_id and m.user_id = auth.uid()
  );
$$;

-- ---------- Tabelas de negócio ----------
create table if not exists financial_accounts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  name text not null,
  kind text default 'banco',
  opening_balance numeric(14,2) default 0,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  description text not null,
  amount numeric(14,2) not null,
  type text not null check (type in ('income','expense')),
  date date not null default current_date,
  category text,
  status text not null default 'pago' check (status in ('pago','previsto')),
  account_id uuid references financial_accounts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists bills (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  description text not null,
  amount numeric(14,2) not null,
  due_date date not null,
  kind text not null default 'pagar' check (kind in ('pagar','receber')),
  status text not null default 'aberto' check (status in ('aberto','pago')),
  created_at timestamptz not null default now()
);

create table if not exists debts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  creditor text not null,
  total numeric(14,2) not null,
  balance numeric(14,2) not null default 0,
  installments int,
  next_due date,
  created_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  name text not null,
  contact text,
  source text,
  estimated_value numeric(14,2),
  stage text not null default 'novo'
    check (stage in ('novo','qualificado','proposta','negociacao','ganho','perdido')),
  next_step text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  name text not null,
  company text,
  contact text,
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  ticket numeric(14,2),
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  name text not null,
  client text,
  status text not null default 'ativo' check (status in ('ativo','pausado','concluido')),
  priority text not null default 'media' check (priority in ('alta','media','baixa')),
  deadline date,
  progress int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  title text not null,
  description text,
  project_id uuid references projects(id) on delete set null,
  priority text not null default 'media' check (priority in ('urgente','alta','media','baixa')),
  status text not null default 'a_fazer' check (status in ('a_fazer','fazendo','feito')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  title text not null,
  type text not null default 'negocio' check (type in ('negocio','pessoal')),
  target numeric(14,2) not null,
  current numeric(14,2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

create table if not exists dreams (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  owner_id uuid references auth.users(id),
  title text not null,
  description text,
  estimated_cost numeric(14,2),
  target_date date,
  achieved boolean not null default false,
  goal_id uuid references goals(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- Índices ----------
create index if not exists idx_tx_org on transactions(org_id);
create index if not exists idx_bills_org on bills(org_id);
create index if not exists idx_debts_org on debts(org_id);
create index if not exists idx_leads_org on leads(org_id);
create index if not exists idx_clients_org on clients(org_id);
create index if not exists idx_projects_org on projects(org_id);
create index if not exists idx_tasks_org on tasks(org_id);
create index if not exists idx_goals_org on goals(org_id);
create index if not exists idx_dreams_org on dreams(org_id);

-- ============================================================
-- RLS
-- ============================================================
alter table profiles            enable row level security;
alter table organizations       enable row level security;
alter table org_members         enable row level security;
alter table financial_accounts  enable row level security;
alter table transactions        enable row level security;
alter table bills               enable row level security;
alter table debts               enable row level security;
alter table leads               enable row level security;
alter table clients             enable row level security;
alter table projects            enable row level security;
alter table tasks               enable row level security;
alter table goals               enable row level security;
alter table dreams              enable row level security;

-- profiles: cada usuário gerencia o próprio
create policy "profile_self_select" on profiles for select using (id = auth.uid());
create policy "profile_self_upsert" on profiles for insert with check (id = auth.uid());
create policy "profile_self_update" on profiles for update using (id = auth.uid());

-- organizations
create policy "org_select_member" on organizations for select using (is_org_member(id) or owner_id = auth.uid());
create policy "org_insert_self"   on organizations for insert with check (owner_id = auth.uid());
create policy "org_update_owner"  on organizations for update using (owner_id = auth.uid());
create policy "org_delete_owner"  on organizations for delete using (owner_id = auth.uid());

-- org_members
create policy "member_select_self" on org_members for select using (user_id = auth.uid() or is_org_member(org_id));
create policy "member_insert"      on org_members for insert with check (
  user_id = auth.uid() or exists (select 1 from organizations o where o.id = org_id and o.owner_id = auth.uid())
);
create policy "member_delete_owner" on org_members for delete using (
  exists (select 1 from organizations o where o.id = org_id and o.owner_id = auth.uid())
);

-- Política padrão para tabelas de negócio: membros da org têm acesso total.
do $$
declare t text;
begin
  foreach t in array array[
    'financial_accounts','transactions','bills','debts','leads',
    'clients','projects','tasks','goals','dreams'
  ]
  loop
    execute format('create policy %I on %I for all using (is_org_member(org_id)) with check (is_org_member(org_id));',
                   t || '_org_all', t);
  end loop;
end $$;
