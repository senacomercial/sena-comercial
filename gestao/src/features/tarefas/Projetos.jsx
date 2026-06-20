import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../../lib/useCollection'
import { dateBR } from '../../lib/format'
import { Button, Card, Badge, PageHeader, EmptyState } from '../../components/ui'
import ProjetoForm from '../projetos/ProjetoForm'

const PRIORITY = { alta: 'red', media: 'amber', baixa: 'neutral' }
const STATUS = { ativo: 'green', pausado: 'amber', concluido: 'neutral' }

export default function Projetos() {
  const navigate = useNavigate()
  const { rows, isLoading } = useCollection('projects', { order: 'created_at' })
  const clients = useCollection('clients', { order: 'name', ascending: true })
  const [open, setOpen] = useState(false)

  const clientName = useMemo(() => {
    const map = {}
    for (const c of clients.rows) map[c.id] = c.name
    return map
  }, [clients.rows])

  return (
    <div>
      <PageHeader
        title="Projetos"
        subtitle="Todos os projetos — clique para abrir tarefas e financeiro"
        action={<Button onClick={() => setOpen(true)}>+ Novo projeto</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum projeto ainda" hint="Crie projetos e acompanhe o progresso." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className="cursor-pointer transition hover:shadow-md" onClick={() => navigate(`/projetos/${r.id}`)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.client_id && <div className="text-sm text-neutral-500">{clientName[r.client_id] || ''}</div>}
                </div>
                <Badge color={STATUS[r.status]}>{r.status}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge color={PRIORITY[r.priority]}>prio. {r.priority}</Badge>
                {r.is_recurring && <Badge color="brand">↻ {r.recurrence}</Badge>}
                {r.deadline && <span className="text-xs text-neutral-400 self-center">prazo {dateBR(r.deadline)}</span>}
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${r.progress || 0}%` }} />
              </div>
              <div className="mt-1 text-xs text-neutral-400">{r.progress || 0}% concluído</div>
            </Card>
          ))}
        </div>
      )}

      <ProjetoForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
