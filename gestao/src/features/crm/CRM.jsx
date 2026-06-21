import { useState, useMemo } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl, today } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Textarea, PageHeader } from '../../components/ui'

export default function CRM() {
  const { rows, create, update, remove, isLoading } = useCollection('leads', { order: 'created_at' })
  const { rows: stages, create: createStage, update: updateStage, remove: removeStage } = useCollection('crm_stages', { order: 'order_pos' })
  const [open, setOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const blank = { name: '', contact: '', source: '', estimated_value: '', stage: '', next_step: '', notes: '' }
  const [form, setForm] = useState(blank)
  const [stageForm, setStageForm] = useState({ label: '' })
  const [dragId, setDragId] = useState(null)

  // Inicializa form.stage com primeira etapa quando stages mudam
  const stageOptions = useMemo(() => {
    const sorted = [...stages].sort((a, b) => a.order_pos - b.order_pos)
    if (form.stage === '' && sorted.length > 0) {
      setForm(f => ({ ...f, stage: sorted[0].id }))
    }
    return sorted
  }, [stages, form.stage])

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, estimated_value: form.estimated_value ? Number(form.estimated_value) : null })
    setOpen(false)
    setForm(blank)
  }

  const saveStage = async (e) => {
    e.preventDefault()
    const maxOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order_pos)) : -1
    await createStage.mutateAsync({ label: stageForm.label, order_pos: maxOrder + 1 })
    setStageForm({ label: '' })
    setStageOpen(false)
  }

  const removeStageHandler = async (stageId) => {
    if (confirm('Excluir esta etapa? Os leads nela serão mantidos.')) {
      await removeStage.mutate(stageId)
    }
  }

  const moveStage = async (stageId, direction) => {
    const stage = stages.find(s => s.id === stageId)
    if (!stage) return
    const nextStage = stages.find(s => direction === 'up' ? s.order_pos < stage.order_pos : s.order_pos > stage.order_pos)
    if (nextStage) {
      await updateStage.mutateAsync({ id: stage.id, order_pos: nextStage.order_pos })
      await updateStage.mutateAsync({ id: nextStage.id, order_pos: stage.order_pos })
    }
  }

  const onDrop = (stageId) => {
    if (dragId) update.mutate({ id: dragId, stage: stageId })
    setDragId(null)
  }

  const sortedStages = useMemo(() => [...stages].sort((a, b) => a.order_pos - b.order_pos), [stages])

  return (
    <div>
      <PageHeader
        title="CRM · Funil de Leads"
        subtitle="Tratativas avançadas — arraste os cards entre as etapas"
        action={
          <div className="flex gap-2">
            <Button onClick={() => setOpen(true)}>+ Novo lead</Button>
            <Button variant="outline" onClick={() => setStageOpen(true)}>⚙️ Etapas</Button>
          </div>
        }
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : sortedStages.length === 0 ? (
        <p className="text-neutral-400">Nenhuma etapa configurada. Clique em "⚙️ Etapas" para adicionar.</p>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {sortedStages.map((st) => {
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
            <Select label="Etapa" value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} required>
              <option value="">— Selecione —</option>
              {sortedStages.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
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

      <Modal open={stageOpen} onClose={() => setStageOpen(false)} title="Gerenciar etapas do funil">
        <div className="space-y-4">
          <form onSubmit={saveStage} className="space-y-2 border-b border-neutral-200 pb-4">
            <div className="flex gap-2">
              <Input
                label="Nova etapa"
                value={stageForm.label}
                onChange={(e) => setStageForm({ label: e.target.value })}
                placeholder="Ex: Em análise"
                required
              />
              <Button type="submit" className="mt-6">+ Adicionar</Button>
            </div>
          </form>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sortedStages.map((st) => (
              <div key={st.id} className="flex items-center justify-between gap-2 p-2 bg-neutral-50 rounded-lg">
                <span className="text-sm font-medium flex-1">{st.label}</span>
                <div className="flex gap-1">
                  {sortedStages[0]?.id !== st.id && (
                    <button
                      type="button"
                      onClick={() => moveStage(st.id, 'up')}
                      className="text-xs px-2 py-1 text-neutral-500 hover:bg-neutral-200 rounded"
                      title="Mover para cima"
                    >
                      ↑
                    </button>
                  )}
                  {sortedStages[sortedStages.length - 1]?.id !== st.id && (
                    <button
                      type="button"
                      onClick={() => moveStage(st.id, 'down')}
                      className="text-xs px-2 py-1 text-neutral-500 hover:bg-neutral-200 rounded"
                      title="Mover para baixo"
                    >
                      ↓
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeStageHandler(st.id)}
                    className="text-xs px-2 py-1 text-neutral-500 hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="button" variant="ghost" onClick={() => setStageOpen(false)}>Fechar</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
