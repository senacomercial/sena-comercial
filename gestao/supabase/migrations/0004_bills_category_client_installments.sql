-- ============================================================
-- Vincula contas (bills) a categoria e cliente + dados de parcelamento
-- ============================================================

alter table bills add column if not exists category_id uuid references categories(id) on delete set null;
alter table bills add column if not exists client_id uuid references clients(id) on delete cascade;
alter table bills add column if not exists installment_number int;
alter table bills add column if not exists installment_total int;
alter table bills add column if not exists contract_group uuid;

-- Dados de contrato no cliente (registro/histórico)
alter table clients add column if not exists contract_value numeric(14,2);
alter table clients add column if not exists contract_installments int;
alter table clients add column if not exists contract_periodicity text;
alter table clients add column if not exists contract_start date;

create index if not exists idx_bills_client on bills(client_id);
create index if not exists idx_bills_contract on bills(contract_group);
