-- ============================================================
-- Categorias padrão criadas automaticamente ao criar organização
-- ============================================================

create or replace function public.create_default_categories(org_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  cat_id uuid;
begin
  -- DESPESAS
  insert into categories (org_id, name, type, color) values (org_id, 'Consultoria', 'expense', '#d4493f') returning id into cat_id;
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Mentorias', 'expense', cat_id, '#e8665c');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Projetos', 'expense', cat_id, '#e8665c');

  insert into categories (org_id, name, type, color) values (org_id, 'Marketing', 'expense', '#d99a16') returning id into cat_id;
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Tráfego Pago', 'expense', cat_id, '#e5ad33');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Design', 'expense', cat_id, '#e5ad33');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Conteúdo', 'expense', cat_id, '#e5ad33');

  insert into categories (org_id, name, type, color) values (org_id, 'Operacional', 'expense', '#6366f1') returning id into cat_id;
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Aluguel', 'expense', cat_id, '#818cf8');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Internet/Telefone', 'expense', cat_id, '#818cf8');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Ferramentas SaaS', 'expense', cat_id, '#818cf8');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Viagens', 'expense', cat_id, '#818cf8');

  insert into categories (org_id, name, type, color) values (org_id, 'Administrativo', 'expense', '#9ca3af') returning id into cat_id;
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Contabilidade', 'expense', cat_id, '#b4b7be');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Impostos', 'expense', cat_id, '#b4b7be');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Seguros', 'expense', cat_id, '#b4b7be');

  -- RECEITAS
  insert into categories (org_id, name, type, color) values (org_id, 'Serviços', 'income', '#1f9d61') returning id into cat_id;
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Consultoria', 'income', cat_id, '#34d399');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Mentoria', 'income', cat_id, '#34d399');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Treinamento', 'income', cat_id, '#34d399');

  insert into categories (org_id, name, type, color) values (org_id, 'Produtos', 'income', '#10b981') returning id into cat_id;
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Vendas', 'income', cat_id, '#6ee7b7');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Cursos/Ebooks', 'income', cat_id, '#6ee7b7');
  insert into categories (org_id, name, type, parent_id, color) values (org_id, 'Comissões', 'income', cat_id, '#6ee7b7');

  insert into categories (org_id, name, type, color) values (org_id, 'Outras Receitas', 'income', '#059669');
end;
$$;

-- Trigger para chamar a função quando uma organização é criada
create or replace function public.trigger_create_default_categories()
returns trigger
language plpgsql
security definer
as $$
begin
  perform public.create_default_categories(new.id);
  return new;
end;
$$;

drop trigger if exists on_organization_created on organizations;
create trigger on_organization_created
  after insert on organizations
  for each row
  execute function public.trigger_create_default_categories();
