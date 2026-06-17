import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { dateBR, today } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Badge, PageHeader, EmptyState } from '../../components/ui'

const PRIORITY = { alta: 'red', media: 'amber', baixa: 'neutral' }
const STATUS = { ativo: 'green', pausado: 'amber', concluido: 'neutral' }

export default function Projetos() {
  const { rows, create, update, remove, isLoading } = useCollection('projects', { order: 'created_at' })
  const [open, setOpen] = useState(false)
  const blank = { name: '', client: '', status: 'ativo', priority: 'media', deadline: today(), progress: 0 }
  const [form, setForm] = useState(blank)

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, progress: Number(form.progress) })
    setOpen(false)
    setForm(blank)
  }

  return (
    <div>
      <PageHeader
        title="Projetos"
        subtitle="Acompanhamento, prazos e prioridades"
        action={<Button onClick={() => setOpen(true)}>+ Novo projeto</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum projeto ainda" hint="Crie projetos e acompanhe o progresso." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.client && <div className="text-sm text-neutral-500">{r.client}</div>}
                </div>
                <button className="text-xs text-neutral-300 hover:text-danger" onClick={() => remove.mutate(r.id)}>✕</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge color={STATUS[r.status]}>{r.status}</Badge>
                <Badge color={PRIORITY[r.priority]}>prioridade {r.priority}</Badge>
                {r.deadline && <span className="text-xs text-neutral-400 self-center">prazo {dateBR(r.deadline)}</span>}
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
                <div className="h-2 rounded-full bg-brand" style={{ width: `${r.progress || 0}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-neutral-400">{r.progress || 0}% concluído</span>
                <input
                  type="range" min="0" max="100" value={r.progress || 0}
                  onChange={(e) => update.mutate({ id: r.id, progress: Number(e.target.value), status: Number(e.target.value) === 100 ? 'concluido' : r.status })}
                  className="w-28 accent-[var(--color-brand)]"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo projeto">
        <form onSubmit={save} className="space-y-3">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Cliente" value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="concluido">Concluído</option>
            </Select>
            <Select label="Prioridade" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </Select>
          </div>
          <Input label="Prazo" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
