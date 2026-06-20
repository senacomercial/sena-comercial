import { useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useCollection } from '../../lib/useCollection'
import { brl, dateBR, today, daysUntil } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Badge, EmptyState } from '../../components/ui'
import ProjetoForm from './ProjetoForm'

const COLUMNS = [
  { id: 'a_fazer', label: 'A fazer' },
  { id: 'fazendo', label: 'Fazendo' },
  { id: 'feito', label: 'Feito' },
]
const PRIORITY = {
  urgente: { label: 'Urgente', color: 'red' },
  alta: { label: 'Alta', color: 'amber' },
  media: { label: 'Média', color: 'brand' },
  baixa: { label: 'Baixa', color: 'neutral' },
}

export default function ProjetoDetalhe() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const projects = useCollection('projects', { order: 'created_at' })
  const clients = useCollection('clients', { order: 'name', ascending: true })
  const bills = useCollection('bills', { order: 'due_date', ascending: true })
  const tasks = useCollection('tasks', { order: 'due_date', ascending: true })
  const projectCosts = useCollection('project_costs')
  const transactions = useCollection('transactions', { order: 'date' })

  const [editOpen, setEditOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)
  const blankTask = { title: '', priority: 'media', status: 'a_fazer', due_date: today() }
  const [taskForm, setTaskForm] = useState(blankTask)
  const [dragId, setDragId] = useState(null)

  const project = projects.rows.find((p) => p.id === projectId)
  const client = clients.rows.find((c) => c.id === project?.client_id)
  const projectBills = useMemo(() => bills.rows.filter((b) => b.project_id === projectId), [bills.rows, projectId])
  const projectTasks = useMemo(() => tasks.rows.filter((t) => t.project_id === projectId), [tasks.rows, projectId])
  const allocatedCosts = useMemo(() => projectCosts.rows.filter((pc) => pc.project_id === projectId), [projectCosts.rows, projectId])

  const fin = useMemo(() => {
    let total = 0, recebido = 0, aberto = 0, custos = 0
    for (const b of projectBills) {
      total += Number(b.amount || 0)
      if (b.status === 'pago') recebido += Number(b.amount || 0)
      else aberto += Number(b.amount || 0)
    }
    for (const c of allocatedCosts) {
      custos += Number(c.amount || 0)
    }
    const lucro = total - custos
    return { total, recebido, aberto, custos, lucro }
  }, [projectBills, allocatedCosts])

  const saveTask = async (e) => {
    e.preventDefault()
    await tasks.create.mutateAsync({ ...taskForm, project_id: projectId })
    setTaskOpen(false)
    setTaskForm(blankTask)
  }
  const onDrop = (status) => {
    if (dragId) tasks.update.mutate({ id: dragId, status })
    setDragId(null)
  }

  if (projects.isLoading) return <p className="text-neutral-400">Carregando…</p>
  if (!project) return (
    <div>
      <p className="text-neutral-500">Projeto não encontrado.</p>
      <Link to="/clientes" className="text-brand-dark hover:underline">← Voltar para clientes</Link>
    </div>
  )

  return (
    <div>
      {/* Trilha de navegação (níveis) */}
      <nav className="mb-3 text-sm text-neutral-400">
        <Link to="/clientes" className="hover:underline">Clientes</Link>
        {client && <> {' / '} <Link to={`/clientes/${client.id}`} className="hover:underline">{client.name}</Link></>}
        {' / '}<span className="text-neutral-600">{project.name}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge color={project.status === 'concluido' ? 'neutral' : project.status === 'pausado' ? 'amber' : 'green'}>{project.status}</Badge>
            <Badge color={project.priority === 'alta' ? 'red' : project.priority === 'media' ? 'amber' : 'neutral'}>prioridade {project.priority}</Badge>
            {project.deadline && <span className="text-xs text-neutral-400">prazo {dateBR(project.deadline)}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>Editar projeto</Button>
          <Button variant="ghost" onClick={async () => { if (confirm('Excluir este projeto?')) { await projects.remove.mutateAsync(project.id); navigate(client ? `/clientes/${client.id}` : '/clientes') } }}>Excluir</Button>
        </div>
      </div>

      {/* Financeiro do projeto */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <Kpi label="Valor contratado" value={brl(fin.total)} />
        <Kpi label="Recebido" value={brl(fin.recebido)} color="text-success" />
        <Kpi label="A receber" value={brl(fin.aberto)} color="text-danger" />
        <Kpi label="Custos" value={brl(fin.custos)} color="text-neutral-600" />
        <Kpi
          label="Lucro"
          value={brl(fin.lucro)}
          color={fin.lucro >= 0 ? 'text-success' : 'text-danger'}
        />
      </div>

      {/* Contas a receber do projeto */}
      <Card className="mt-6 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <span className="font-medium">Recebimentos ({projectBills.length})</span>
          <Link to="/financeiro" className="text-sm text-brand-dark hover:underline">abrir financeiro</Link>
        </div>
        {projectBills.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">Nenhum recebimento. Edite o projeto e configure o financeiro.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {projectBills.map((b) => {
              const d = daysUntil(b.due_date)
              const overdue = b.status !== 'pago' && d != null && d < 0
              return (
                <li key={b.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="text-neutral-600">{dateBR(b.due_date)} {b.installment_total ? `· ${b.installment_number}/${b.installment_total}` : ''}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{brl(b.amount)}</span>
                    <Badge color={b.status === 'pago' ? 'green' : overdue ? 'red' : 'amber'}>{b.status === 'pago' ? 'pago' : 'aberto'}</Badge>
                    {b.status !== 'pago' && (
                      <button className="text-xs text-success hover:underline" onClick={() => bills.update.mutate({ id: b.id, status: 'pago' })}>baixar</button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Custos alocados do projeto */}
      <Card className="mt-6 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
          <span className="font-medium">Custos alocados ({allocatedCosts.length})</span>
          <Link to="/financeiro" className="text-sm text-brand-dark hover:underline">abrir financeiro</Link>
        </div>
        {allocatedCosts.length === 0 ? (
          <p className="p-4 text-sm text-neutral-400">Nenhum custo alocado ainda. Aloque despesas na aba Financeiro.</p>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {allocatedCosts.map((c) => {
              const trans = transactions.rows.find((t) => t.id === c.transaction_id)
              return (
                <li key={c.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <div className="font-medium">{trans?.description || '?'}</div>
                    <div className="text-xs text-neutral-400">{trans?.date ? dateBR(trans.date) : '—'}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-danger">{brl(c.amount)}</span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Card>

      {/* Tarefas do projeto */}
      <div className="mt-8 mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Tarefas do projeto</h2>
        <Button onClick={() => setTaskOpen(true)}>+ Nova tarefa</Button>
      </div>
      {projectTasks.length === 0 ? (
        <EmptyState title="Nenhuma tarefa" hint="Crie as tarefas deste projeto." />
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const list = projectTasks.filter((t) => t.status === col.id)
            return (
              <div key={col.id} onDragOver={(e) => e.preventDefault()} onDrop={() => onDrop(col.id)}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold">{col.label}</span>
                  <span className="text-xs text-neutral-400">{list.length}</span>
                </div>
                <div className="space-y-2 rounded-xl bg-neutral-100/60 p-2 min-h-24">
                  {list.map((r) => {
                    const d = daysUntil(r.due_date)
                    const late = col.id !== 'feito' && d != null && d < 0
                    const prio = PRIORITY[r.priority] || PRIORITY.media
                    return (
                      <Card key={r.id} draggable onDragStart={() => setDragId(r.id)} className="cursor-grab p-3 active:cursor-grabbing">
                        <div className="flex items-start justify-between gap-2">
                          <div className={'font-medium ' + (col.id === 'feito' ? 'text-neutral-400 line-through' : '')}>{r.title}</div>
                          <button className="text-xs text-neutral-300 hover:text-danger" onClick={() => tasks.remove.mutate(r.id)}>✕</button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge color={prio.color}>{prio.label}</Badge>
                          {r.due_date && <span className={'text-xs ' + (late ? 'text-danger font-medium' : 'text-neutral-400')}>{late ? 'atrasada · ' : ''}{dateBR(r.due_date)}</span>}
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ProjetoForm open={editOpen} onClose={() => setEditOpen(false)} editing={project} />

      <Modal open={taskOpen} onClose={() => setTaskOpen(false)} title="Nova tarefa">
        <form onSubmit={saveTask} className="space-y-3">
          <Input label="Título" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Prioridade" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Input label="Prazo" type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setTaskOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Kpi({ label, value, color }) {
  return (
    <Card>
      <div className="text-sm text-neutral-500">{label}</div>
      <div className={'mt-1 text-xl font-semibold ' + (color || '')}>{value}</div>
    </Card>
  )
}
