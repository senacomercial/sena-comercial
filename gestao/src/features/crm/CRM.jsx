import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl, today } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Textarea, PageHeader } from '../../components/ui'

const STAGES = [
  { id: 'novo', label: 'Novo' },
  { id: 'qualificado', label: 'Qualificado' },
  { id: 'proposta', label: 'Proposta' },
  { id: 'negociacao', label: 'Negociação' },
  { id: 'ganho', label: 'Ganho' },
  { id: 'perdido', label: 'Perdido' },
]

export default function CRM() {
  const { rows, create, update, remove, isLoading } = useCollection('leads', { order: 'created_at' })
  const [open, setOpen] = useState(false)
  const blank = { name: '', contact: '', source: '', estimated_value: '', stage: 'novo', next_step: '', notes: '' }
  const [form, setForm] = useState(blank)
  const [dragId, setDragId] = useState(null)

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, estimated_value: form.estimated_value ? Number(form.estimated_value) : null })
    setOpen(false)
    setForm(blank)
  }

  const onDrop = (stage) => {
    if (dragId) update.mutate({ id: dragId, stage })
    setDragId(null)
  }

  return (
    <div>
      <PageHeader
        title="CRM · Funil de Leads"
        subtitle="Tratativas avançadas — arraste os cards entre as etapas"
        action={<Button onClick={() => setOpen(true)}>+ Novo lead</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((st) => {
            const list = rows.filter((r) => r.stage === st.id)
            const sum = list.reduce((s, r) => s + Number(r.estimated_value || 0), 0)
            return (
              <div
                key={st.id}
                className="w-72 flex-shrink-0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onDrop(st.id)}
              >
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-sm font-semibold">{st.label}</span>
                  <span className="text-xs text-neutral-400">{list.length} · {brl(sum)}</span>
                </div>
                <div className="space-y-2 rounded-xl bg-neutral-100/60 p-2 min-h-24">
                  {list.map((r) => (
                    <Card
                      key={r.id}
                      draggable
                      onDragStart={() => setDragId(r.id)}
                      className="cursor-grab p-3 active:cursor-grabbing"
                    >
                      <div className="flex items-start justify-between">
                        <div className="font-medium">{r.name}</div>
                        <button className="text-xs text-neutral-300 hover:text-danger" onClick={() => remove.mutate(r.id)}>✕</button>
                      </div>
                      {r.contact && <div className="text-xs text-neutral-500">{r.contact}</div>}
                      {r.estimated_value ? <div className="mt-1 text-sm font-semibold text-brand-dark">{brl(r.estimated_value)}</div> : null}
                      {r.next_step && <div className="mt-1 text-xs text-neutral-400">→ {r.next_step}</div>}
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo lead">
        <form onSubmit={save} className="space-y-3">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contato" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="WhatsApp / e-mail" />
            <Input label="Origem" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Indicação, Ads…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor estimado (R$)" type="number" step="0.01" value={form.estimated_value} onChange={(e) => setForm({ ...form, estimated_value: e.target.value })} />
            <Select label="Etapa" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })}>
              {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </div>
          <Input label="Próximo passo" value={form.next_step} onChange={(e) => setForm({ ...form, next_step: e.target.value })} />
          <Textarea label="Notas" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
