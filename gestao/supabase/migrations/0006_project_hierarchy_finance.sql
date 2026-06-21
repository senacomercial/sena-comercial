-- ============================================================
-- Hierarquia Cliente → Projeto → Tarefas + financeiro no projeto
-- ============================================================

-- Projeto pertence a um cliente
alter table projects add column if not exists client_id uuid references clients(id) on delete set null;

-- Financeiro do projeto (recebimento)
alter table projects add column if not exists receivable_value numeric(14,2);
alter table projects add column if not exists is_recurring boolean not null default false;
alter table projects add column if not exists recurrence text;          -- diaria | semanal | quinzenal | mensal
alter table projects add column if not exists payment_start date;       -- data do 1º recebimento
alter table projects add column if not exists installments int;         -- nº parcelas (quando não recorrente)
alter table projects add column if not exists category_id uuid references categories(id) on delete set null;

-- Conta vinculada ao projeto
alter table bills add column if not exists project_id uuid references projects(id) on delete cascade;

create index if not exists idx_projects_client on projects(client_id);
create index if not exists idx_bills_project on bills(project_id);
