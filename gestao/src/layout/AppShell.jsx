import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider'

const nav = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/crm', label: 'CRM · Leads', icon: '🎯' },
  { to: '/clientes', label: 'Clientes ▸ Projetos ▸ Tarefas', icon: '🤝' },
  { to: '/projetos', label: 'Projetos (todos)', icon: '📁' },
  { to: '/tarefas', label: 'Tarefas (todas)', icon: '✅' },
  { to: '/financeiro', label: 'Financeiro', icon: '💰' },
  { to: '/metas', label: 'Metas & Sonhos', icon: '⭐' },
]

export default function AppShell() {
  const { user, org, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ' +
    (isActive ? 'bg-brand/15 text-brand-dark' : 'text-neutral-600 hover:bg-neutral-100')

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-neutral-200 bg-white">
      <div className="px-5 py-5">
        <div className="text-lg font-semibold tracking-tight">SENA COMERCIAL</div>
        <div className="text-xs text-neutral-400">{org?.name || 'Gestão'}</div>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={linkClass} onClick={() => setOpen(false)}>
            <span>{n.icon}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-neutral-200 p-3">
        <div className="truncate px-2 text-xs text-neutral-500">{user?.email}</div>
        <button
          onClick={signOut}
          className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100"
        >
          Sair
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden md:block">{Sidebar}</div>

      {/* Sidebar mobile */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full">{Sidebar}</div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 border-b border-neutral-200 bg-white px-4 py-3 md:hidden">
          <button onClick={() => setOpen(true)} className="text-xl">☰</button>
          <span className="font-semibold">SENA COMERCIAL</span>
        </header>
        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
