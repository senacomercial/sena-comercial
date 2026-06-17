import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl, dateBR, today } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Textarea, Badge, PageHeader, EmptyState } from '../../components/ui'

export default function Metas() {
  return (
    <div className="space-y-10">
      <Goals />
      <Dreams />
    </div>
  )
}

function Goals() {
  const { rows, create, update, remove, isLoading } = useCollection('goals', { order: 'deadline', ascending: true })
  const [open, setOpen] = useState(false)
  const blank = { title: '', type: 'negocio', target: '', current: '0', deadline: today() }
  const [form, setForm] = useState(blank)

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, target: Number(form.target), current: Number(form.current) })
    setOpen(false)
    setForm(blank)
  }

  return (
    <div>
      <PageHeader
        title="Metas"
        subtitle="Objetivos de negócio e pessoais"
        action={<Button onClick={() => setOpen(true)}>+ Nova meta</Button>}
      />
      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhuma meta definida" hint="Defina metas mensuráveis com valor-alvo." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const pct = r.target ? Math.min(100, Math.round((r.current / r.target) * 100)) : 0
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between">
                  <div className="font-medium">{r.title}</div>
                  <button className="text-xs text-neutral-300 hover:text-danger" onClick={() => remove.mutate(r.id)}>✕</button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge color={r.type === 'negocio' ? 'brand' : 'green'}>{r.type}</Badge>
                  {r.deadline && <span className="text-xs text-neutral-400">até {dateBR(r.deadline)}</span>}
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-success" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-500">{brl(r.current)} / {brl(r.target)}</span>
                  <span className="font-medium text-success">{pct}%</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number" step="0.01" defaultValue={r.current}
                    onBlur={(e) => update.mutate({ id: r.id, current: Number(e.target.value) })}
                    className="w-full rounded-lg border border-neutral-200 px-2 py-1 text-sm"
                    aria-label="Atualizar valor atual"
                  />
                  <span className="text-xs text-neutral-400 whitespace-nowrap">atualizar</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova meta">
        <form onSubmit={save} className="space-y-3">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="negocio">Negócio</option>
            <option value="pessoal">Pessoal</option>
          </Select>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor-alvo (R$)" type="number" step="0.01" value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })} required />
            <Input label="Valor atual (R$)" type="number" step="0.01" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
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

function Dreams() {
  const { rows, create, update, remove, isLoading } = useCollection('dreams', { order: 'target_date', ascending: true })
  const [open, setOpen] = useState(false)
  const blank = { title: '', description: '', estimated_cost: '', target_date: '', achieved: false }
  const [form, setForm] = useState(blank)

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, estimated_cost: form.estimated_cost ? Number(form.estimated_cost) : null, target_date: form.target_date || null })
    setOpen(false)
    setForm(blank)
  }

  return (
    <div>
      <PageHeader
        title="Sonhos"
        subtitle="O que move a SENA — visão de longo prazo"
        action={<Button onClick={() => setOpen(true)}>+ Novo sonho</Button>}
      />
      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum sonho registrado" hint="Sonhe grande — registre seus objetivos de vida." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className={r.achieved ? 'opacity-70' : ''}>
              <div className="flex items-start justify-between">
                <div className="font-medium">{r.achieved ? '🏆 ' : '✨ '}{r.title}</div>
                <button className="text-xs text-neutral-300 hover:text-danger" onClick={() => remove.mutate(r.id)}>✕</button>
              </div>
              {r.description && <p className="mt-1 text-sm text-neutral-500">{r.description}</p>}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {r.estimated_cost ? <span className="font-semibold text-brand-dark">{brl(r.estimated_cost)}</span> : null}
                {r.target_date && <span className="text-xs text-neutral-400">{dateBR(r.target_date)}</span>}
              </div>
              <button
                className="mt-3 text-xs text-success hover:underline"
                onClick={() => update.mutate({ id: r.id, achieved: !r.achieved })}
              >
                {r.achieved ? 'reabrir' : 'marcar como realizado'}
              </button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo sonho">
        <form onSubmit={save} className="space-y-3">
          <Input label="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Custo estimado (R$)" type="number" step="0.01" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} />
            <Input label="Data desejada" type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
