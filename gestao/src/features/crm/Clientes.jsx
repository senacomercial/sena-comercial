import { useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl } from '../../lib/format'
import { Button, Card, Modal, Input, Select, Textarea, Badge, PageHeader, EmptyState } from '../../components/ui'

export default function Clientes() {
  const { rows, create, update, remove, isLoading } = useCollection('clients', { order: 'name', ascending: true })
  const [open, setOpen] = useState(false)
  const blank = { name: '', contact: '', company: '', status: 'ativo', ticket: '', notes: '' }
  const [form, setForm] = useState(blank)

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({ ...form, ticket: form.ticket ? Number(form.ticket) : null })
    setOpen(false)
    setForm(blank)
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Carteira de clientes da consultoria"
        action={<Button onClick={() => setOpen(true)}>+ Novo cliente</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum cliente ainda" hint="Cadastre seus clientes ativos e inativos." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => (
            <Card key={r.id}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{r.name}</div>
                  {r.company && <div className="text-sm text-neutral-500">{r.company}</div>}
                </div>
                <Badge color={r.status === 'ativo' ? 'green' : 'neutral'}>{r.status}</Badge>
              </div>
              {r.contact && <div className="mt-2 text-sm text-neutral-500">{r.contact}</div>}
              {r.ticket ? <div className="mt-1 text-sm font-semibold text-brand-dark">{brl(r.ticket)}</div> : null}
              <div className="mt-3 flex gap-3 text-xs">
                <button className="text-neutral-400 hover:text-brand-dark" onClick={() => update.mutate({ id: r.id, status: r.status === 'ativo' ? 'inativo' : 'ativo' })}>
                  {r.status === 'ativo' ? 'marcar inativo' : 'reativar'}
                </button>
                <button className="text-neutral-400 hover:text-danger" onClick={() => remove.mutate(r.id)}>excluir</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Novo cliente">
        <form onSubmit={save} className="space-y-3">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Empresa" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            <Input label="Contato" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ticket (R$)" type="number" step="0.01" value={form.ticket} onChange={(e) => setForm({ ...form, ticket: e.target.value })} />
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
