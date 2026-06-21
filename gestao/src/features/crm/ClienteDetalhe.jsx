import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCollection } from '../../lib/useCollection'
import { brl, dateBR } from '../../lib/format'
import { Button, Card, Badge, EmptyState } from '../../components/ui'
import ProjetoForm from '../projetos/ProjetoForm'

const STATUS = { ativo: 'green', pausado: 'amber', concluido: 'neutral' }
const PRIORITY = { alta: 'red', media: 'amber', baixa: 'neutral' }

export default function ClienteDetalhe() {
  const { clientId } = useParams()
  const navigate = useNavigate()
  const clients = useCollection('clients', { order: 'name', ascending: true })
  const projects = useCollection('projects', { order: 'created_at' })
  const bills = useCollection('bills', { order: 'due_date', ascending: true })
  const [projOpen, setProjOpen] = useState(false)

  const client = clients.rows.find((c) => c.id === clientId)
  const clientProjects = useMemo(() => projects.rows.filter((p) => p.client_id === clientId), [projects.rows, clientId])

  // Total a receber em aberto por projeto.
  const openByProject = useMemo(() => {
    const map = {}
    for (const b of bills.rows) {
      if (b.status === 'pago' || !b.project_id) continue
      map[b.project_id] = (map[b.project_id] || 0) + Number(b.amount || 0)
    }
    return map
  }, [bills.rows])

  if (clients.isLoading) return <p className="text-neutral-400">Carregando…</p>
  if (!client) return (
    <div>
      <p className="text-neutral-500">Cliente não encontrado.</p>
      <Link to="/clientes" className="text-brand-dark hover:underline">← Voltar para clientes</Link>
    </div>
  )

  return (
    <div>
      <nav className="mb-3 text-sm text-neutral-400">
        <Link to="/clientes" className="hover:underline">Clientes</Link>
        {' / '}<span className="text-neutral-600">{client.name}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{client.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-neutral-500">
            {client.company && <span>{client.company}</span>}
            {client.contact && <span>· {client.contact}</span>}
            <Badge color={client.status === 'ativo' ? 'green' : 'neutral'}>{client.status}</Badge>
          </div>
          {client.notes && <p className="mt-2 max-w-xl text-sm text-neutral-500">{client.notes}</p>}
        </div>
        <Button onClick={() => setProjOpen(true)}>+ Novo projeto</Button>
      </div>

      <h2 className="mb-3 text-lg font-semibold">Projetos ({clientProjects.length})</h2>

      {clientProjects.length === 0 ? (
        <EmptyState title="Nenhum projeto deste cliente" hint="Crie um projeto e configure o recebimento (recorrente ou parcelado)." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clientProjects.map((p) => (
            <Card key={p.id} className="cursor-pointer transition hover:shadow-md" onClick={() => navigate(`/projetos/${p.id}`)}>
              <div className="flex items-start justify-between">
                <div className="font-medium">{p.name}</div>
                <Badge color={STATUS[p.status]}>{p.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge color={PRIORITY[p.priority]}>prio. {p.priority}</Badge>
                {p.is_recurring && <Badge color="brand">↻ {p.recurrence}</Badge>}
                {p.deadline && <span className="text-xs text-neutral-400">prazo {dateBR(p.deadline)}</span>}
              </div>
              {p.receivable_value ? (
                <div className="mt-2 text-sm">
                  <span className="font-semibold text-brand-dark">{brl(p.receivable_value)}</span>
                  <span className="text-neutral-400">{p.is_recurring ? `/${p.recurrence}` : ' total'}</span>
                  {openByProject[p.id] ? <span className="ml-2 text-xs text-danger">a receber {brl(openByProject[p.id])}</span> : null}
                </div>
              ) : null}
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${p.progress || 0}%` }} />
              </div>
              <div className="mt-1 text-xs text-neutral-400">{p.progress || 0}% concluído</div>
            </Card>
          ))}
        </div>
      )}

      <ProjetoForm open={projOpen} onClose={() => setProjOpen(false)} defaultClientId={clientId} />
    </div>
  )
}
