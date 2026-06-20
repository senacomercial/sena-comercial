import { Routes, Route } from 'react-router-dom'
import { useAuth } from './auth/AuthProvider'
import Login from './auth/Login'
import AppShell from './layout/AppShell'
import Dashboard from './features/dashboard/Dashboard'
import Financeiro from './features/financeiro/Financeiro'
import CRM from './features/crm/CRM'
import Clientes from './features/crm/Clientes'
import ClienteDetalhe from './features/crm/ClienteDetalhe'
import Tarefas from './features/tarefas/Tarefas'
import Projetos from './features/tarefas/Projetos'
import ProjetoDetalhe from './features/projetos/ProjetoDetalhe'
import Metas from './features/metas/Metas'

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="grid h-screen place-items-center text-neutral-400">Carregando…</div>
    )
  }

  if (!session) return <Login />

  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="crm" element={<CRM />} />
        <Route path="clientes" element={<Clientes />} />
        <Route path="clientes/:clientId" element={<ClienteDetalhe />} />
        <Route path="tarefas" element={<Tarefas />} />
        <Route path="projetos" element={<Projetos />} />
        <Route path="projetos/:projectId" element={<ProjetoDetalhe />} />
        <Route path="metas" element={<Metas />} />
      </Route>
    </Routes>
  )
}
