import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCollection } from '../../lib/useCollection'
import { brl } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Textarea, Badge, PageHeader, EmptyState } from '../../components/ui'

export default function Clientes() {
  const navigate = useNavigate()
  const { rows, create, update, remove, isLoading } = useCollection('clients', { order: 'name', ascending: true })
  const projects = useCollection('projects', { order: 'created_at' })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const blank = { name: '', contact: '', company: '', status: 'ativo', ticket: '', notes: '' }
  const [form, setForm] = useState(blank)

  const projectCount = useMemo(() => {
    const map = {}
    for (const p of projects.rows) {
      if (p.client_id) map[p.client_id] = (map[p.client_id] || 0) + 1
    }
    return map
  }, [projects.rows])

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({ name: r.name, contact: r.contact || '', company: r.company || '', status: r.status, ticket: r.ticket ?? '', notes: r.notes || '' })
    setOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    const payload = { ...form, ticket: form.ticket ? Number(form.ticket) : null }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
    setForm(blank)
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Nível 1 · cadastre o cliente e abra para gerenciar seus projetos"
        action={<Button onClick={openNew}>+ Novo cliente</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum cliente ainda" hint="Cadastre seu primeiro cliente para começar." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id} className="cursor-pointer transition hover:shadow-md" onClick={() => navigate(`/clientes/${r.id}`)}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.company && <div className="text-sm text-neutral-500">{r.company}</div>}
                </div>
                <Badge color={r.status === 'ativo' ? 'green' : 'neutral'}>{r.status}</Badge>
              </div>
              {r.contact && <div className="mt-2 text-sm text-neutral-500">{r.contact}</div>}
              <div className="mt-2 text-xs text-neutral-400">
                {projectCount[r.id] || 0} projeto(s){r.ticket ? ` · ticket ${brl(r.ticket)}` : ''}
              </div>
              <div className="mt-3 flex gap-3 text-xs" onClick={(e) => e.stopPropagation()}>
                <button className="text-brand-dark hover:underline" onClick={() => navigate(`/clientes/${r.id}`)}>abrir →</button>
                <button className="text-neutral-400 hover:text-brand-dark" onClick={() => openEdit(r)}>editar</button>
                <button className="text-neutral-400 hover:text-brand-dark" onClick={() => update.mutate({ id: r.id, status: r.status === 'ativo' ? 'inativo' : 'ativo' })}>
                  {r.status === 'ativo' ? 'inativar' : 'reativar'}
                </button>
                <button className="text-neutral-400 hover:text-danger" onClick={() => remove.mutate(r.id)}>excluir</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'}>
        <form onSubmit={save} className="space-y-3">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input label="Contato" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ticket de referência (R$)" type="number" step="0.01" value={form.ticket} onChange={(e) => setForm({ ...form, ticket: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </Select>
          </div>
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
