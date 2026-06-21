-- ============================================================
-- CRM Stages: Etapas customizáveis do funil de leads
-- ============================================================

create table if not exists crm_stages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  label text not null,
  order_pos int not null default 0,
  created_at timestamptz not null default now(),

  unique(org_id, label)
);

-- Índices para performance
create index if not exists idx_crm_stages_org on crm_stages(org_id);
create index if not exists idx_crm_stages_order on crm_stages(org_id, order_pos);

-- RLS: usuários só veem stages da sua organização
alter table crm_stages enable row level security;

create policy "org_isolation" on crm_stages
  for all using (org_id = auth.uid()::uuid or exists (
    select 1 from org_members m
    where m.org_id = crm_stages.org_id and m.user_id = auth.uid()
  ));

-- Função para criar stages padrão na primeira organização
create or replace function create_default_crm_stages()
returns trigger
language plpgsql
as $$
begin
  insert into crm_stages (org_id, label, order_pos)
  values
    (new.id, 'Novo', 0),
    (new.id, 'Qualificado', 1),
    (new.id, 'Proposta', 2),
    (new.id, 'Negociação', 3),
    (new.id, 'Ganho', 4),
    (new.id, 'Perdido', 5)
  on conflict (org_id, label) do nothing;
  return new;
end;
$$;

-- Trigger para criar stages padrão
create trigger trigger_create_default_crm_stages
after insert on organizations
for each row
execute function create_default_crm_stages();
