# SENA COMERCIAL · Painel de Gestão ("EUgência")

Sistema web interno para gerenciar a consultoria SENA COMERCIAL: financeiro,
contas, dívidas, CRM (leads e clientes), tarefas/projetos e metas/sonhos.

## Stack
- React 19 + Vite 6 + React Router 7
- Tailwind CSS v4
- Supabase (Postgres + Auth + RLS)
- TanStack Query · Recharts

## Módulos
- **Dashboard** — KPIs (saldo, contas a pagar, pipeline, tarefas) + gráfico receita×despesa.
- **Financeiro** — lançamentos (receita/despesa), contas a pagar/receber, dívidas.
- **CRM** — funil de leads em kanban (arraste entre etapas) + carteira de clientes.
- **Tarefas** — kanban por status com prioridade e prazo.
- **Projetos** — acompanhamento com barra de progresso.
- **Metas & Sonhos** — objetivos com progresso e lista de sonhos.

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um projeto no [Supabase](https://supabase.com) e aplique a migration:
   - SQL em `supabase/migrations/0001_init.sql` (rode no SQL Editor do Supabase).

3. Configure as variáveis de ambiente — copie `.env.example` para `.env.local`:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-anon-key
   ```

4. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```

No primeiro login/cadastro, o app cria automaticamente seu `profile`, a
organização **SENA COMERCIAL** e o vínculo de membro (`owner`).

## Deploy (Netlify)
- Build command: `npm run build` · Publish: `dist`
- Defina `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas variáveis do site.

## Segurança
Todas as tabelas usam Row Level Security: cada usuário só enxerga dados das
organizações às quais pertence (`org_members`). Convide sócios inserindo
registros em `org_members` (futuro: tela de convites).
