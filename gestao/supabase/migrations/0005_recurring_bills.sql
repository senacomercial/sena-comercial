-- ============================================================
-- Recorrência em contas (bills) — para cálculo de MRR e lançamentos recorrentes
-- ============================================================

alter table bills add column if not exists is_recurring boolean not null default false;
alter table bills add column if not exists recurrence text; -- diaria | semanal | quinzenal | mensal
alter table bills add column if not exists recurrence_group uuid;

create index if not exists idx_bills_recurrence on bills(recurrence_group);
