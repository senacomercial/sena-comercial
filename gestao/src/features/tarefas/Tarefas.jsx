import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { dateBR, today, daysUntil } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Badge, PageHeader } from '../../components/ui'

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

export default function Tarefas() {
  const { rows, create, update, remove, isLoading } = useCollection('tasks', { order: 'due_date', ascending: true })
  const projects = useCollection('projects', { order: 'name', ascending: true })
  const [open, setOpen] = useState(false)
  const blank = { title: '', priority: 'media', status: 'a_fazer', due_date: today(), project_id: '' }
  const [form, setForm] = useState(blank)
  const [dragId, setDragId] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, project_id: form.project_id || null })
    setOpen(false)
    setForm(blank)
  }

  const onDrop = (status) => {
    if (dragId) update.mutate({ id: dragId, status })
    setDragId(null)
  }

  return (
    <div>
      <PageHeader
        title="Tarefas"
        subtitle="Prazos e prioridades — arraste entre as colunas"
        action={<Button onClick={() => setOpen(true)}>+ Nova tarefa</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const list = rows.filter((r) => r.status === col.id)
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
                          <button className="text-xs text-neutral-300 hover:text-danger" onClick={() => remove.mutate(r.id)}>✕</button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge color={prio.color}>{prio.label}</Badge>
                          {r.due_date && (
                            <span className={'text-xs ' + (late ? 'text-danger font-medium' : 'text-neutral-400')}>
                              {late ? 'atrasada · ' : ''}{dateBR(r.due_date)}
                            </span>
                          )}
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

      <Modal open={open} onClose={() => setOpen(false)} title="Nova tarefa">
        <form onSubmit={save} className="space-y-3">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Prioridade" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              {Object.entries(PRIORITY).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </Select>
            <Input label="Prazo" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <Select label="Projeto" value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value })}>
            <option value="">— sem projeto —</option>
            {projects.rows.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
