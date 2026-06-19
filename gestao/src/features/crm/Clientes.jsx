import { useMemo, useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl, today, dateBR } from '../../lib/format'
import { PERIODICITIES, buildInstallments } from '../../lib/installments'
import { Button, Card, Modal, Input, Select, Textarea, Badge, PageHeader, EmptyState } from '../../components/ui'

export default function Clientes() {
  const { rows, create, update, remove, isLoading } = useCollection('clients', { order: 'name', ascending: true })
  const bills = useCollection('bills', { order: 'due_date', ascending: true })
  const { rows: categories } = useCollection('categories', { order: 'name', ascending: true })

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const blank = {
    name: '', contact: '', company: '', status: 'ativo', ticket: '', notes: '',
    // contrato / parcelas
    generate: false,
    contract_value: '',
    installments: '1',
    periodicity: 'mensal',
    start: today(),
    kind: 'receber',
    category_id: '',
  }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  // Categorias filtradas pelo tipo (receber→income, pagar→expense), incluindo subcategorias.
  const catOptions = useMemo(() => {
    const wantType = form.kind === 'receber' ? 'income' : 'expense'
    const parents = categories.filter((c) => !c.parent_id && c.type === wantType)
    const out = []
    for (const p of parents) {
      out.push({ id: p.id, label: p.name })
      categories
        .filter((c) => c.parent_id === p.id)
        .forEach((s) => out.push({ id: s.id, label: `  └ ${s.name}` }))
    }
    return out
  }, [categories, form.kind])

  // Pré-visualização das parcelas geradas.
  const preview = useMemo(() => {
    const total = Number(form.contract_value || 0)
    const n = Math.max(1, parseInt(form.installments || '1', 10))
    if (!form.generate || total <= 0) return []
    const per = Math.round((total / n) * 100) / 100
    const list = buildInstallments({
      startDate: form.start,
      installments: n,
      periodicity: form.periodicity,
      amountPerInstallment: per,
    })
    // Ajusta a última parcela para fechar o total exato.
    const sum = per * n
    const diff = Math.round((total - sum) * 100) / 100
    if (diff !== 0 && list.length) list[list.length - 1].amount = Math.round((per + diff) * 100) / 100
    return list
  }, [form.generate, form.contract_value, form.installments, form.periodicity, form.start])

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true) }
  const openEdit = (r) => {
    setEditing(r)
    setForm({
      ...blank,
      name: r.name, contact: r.contact || '', company: r.company || '',
      status: r.status, ticket: r.ticket ?? '', notes: r.notes || '',
      contract_value: r.contract_value ?? '',
      installments: String(r.contract_installments || 1),
      periodicity: r.contract_periodicity || 'mensal',
      start: r.contract_start || today(),
      generate: false, // por padrão não regenera ao editar
    })
    setOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const clientPayload = {
        name: form.name,
        contact: form.contact,
        company: form.company,
        status: form.status,
        ticket: form.ticket ? Number(form.ticket) : null,
        notes: form.notes,
        contract_value: form.contract_value ? Number(form.contract_value) : null,
        contract_installments: form.generate ? parseInt(form.installments, 10) : null,
        contract_periodicity: form.generate ? form.periodicity : null,
        contract_start: form.generate ? form.start : null,
      }

      let client
      if (editing) {
        client = await update.mutateAsync({ id: editing.id, ...clientPayload })
      } else {
        client = await create.mutateAsync(clientPayload)
      }

      // Gera parcelas no contas a pagar/receber
      if (form.generate && preview.length && client?.id) {
        const group = crypto.randomUUID()
        const kindLabel = form.kind === 'receber' ? 'Recebimento' : 'Pagamento'
        for (const p of preview) {
          await bills.create.mutateAsync({
            description: `${kindLabel} ${form.name} (${p.number}/${p.total})`,
            amount: p.amount,
            due_date: p.due_date,
            kind: form.kind,
            status: 'aberto',
            category_id: form.category_id || null,
            client_id: client.id,
            installment_number: p.number,
            installment_total: p.total,
            contract_group: group,
          })
        }
      }

      setOpen(false)
      setForm(blank)
    } finally {
      setSaving(false)
    }
  }

  // Conta parcelas vinculadas a cada cliente.
  const billsByClient = useMemo(() => {
    const map = {}
    for (const b of bills.rows) {
      if (!b.client_id) continue
      if (!map[b.client_id]) map[b.client_id] = { total: 0, open: 0, count: 0 }
      map[b.client_id].count++
      map[b.client_id].total += Number(b.amount || 0)
      if (b.status !== 'pago') map[b.client_id].open += Number(b.amount || 0)
    }
    return map
  }, [bills.rows])

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle="Carteira de clientes da consultoria"
        action={<Button onClick={openNew}>+ Novo cliente</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum cliente ainda" hint="Cadastre seus clientes ativos e inativos." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r) => {
            const b = billsByClient[r.id]
            return (
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
                {b && (
                  <div className="mt-2 rounded-lg bg-neutral-50 p-2 text-xs text-neutral-600">
                    {b.count} parcela(s) · em aberto <strong>{brl(b.open)}</strong> de {brl(b.total)}
                  </div>
                )}
                <div className="mt-3 flex gap-3 text-xs">
                  <button className="text-neutral-400 hover:text-brand-dark" onClick={() => openEdit(r)}>editar</button>
                  <button className="text-neutral-400 hover:text-brand-dark" onClick={() => update.mutate({ id: r.id, status: r.status === 'ativo' ? 'inativo' : 'ativo' })}>
                    {r.status === 'ativo' ? 'inativar' : 'reativar'}
                  </button>
                  <button className="text-neutral-400 hover:text-danger" onClick={() => remove.mutate(r.id)}>excluir</button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar cliente' : 'Novo cliente'}>
        <form onSubmit={save} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
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

          {/* ----- Contrato / parcelas ----- */}
          <div className="rounded-lg border border-neutral-200 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.generate} onChange={(e) => setForm({ ...form, generate: e.target.checked })} />
              Gerar parcelas no financeiro (contas a pagar/receber)
            </label>

            {form.generate && (
              <div className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Valor total do contrato (R$)" type="number" step="0.01" value={form.contract_value} onChange={(e) => setForm({ ...form, contract_value: e.target.value })} required={form.generate} />
                  <Input label="Nº de parcelas" type="number" min="1" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} required={form.generate} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Periodicidade" value={form.periodicity} onChange={(e) => setForm({ ...form, periodicity: e.target.value })}>
                    {PERIODICITIES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </Select>
                  <Input label="Data do 1º pagamento" type="date" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} required={form.generate} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Destino" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, category_id: '' })}>
                    <option value="receber">Contas a receber</option>
                    <option value="pagar">Contas a pagar</option>
                  </Select>
                  <Select label="Categoria" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                    <option value="">— Sem categoria —</option>
                    {catOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </Select>
                </div>

                {preview.length > 0 && (
                  <div className="rounded-lg bg-neutral-50 p-2 text-xs">
                    <div className="mb-1 font-medium text-neutral-600">{preview.length} parcela(s) — total {brl(preview.reduce((s, p) => s + p.amount, 0))}</div>
                    <div className="max-h-28 overflow-y-auto space-y-0.5">
                      {preview.map((p) => (
                        <div key={p.number} className="flex justify-between text-neutral-500">
                          <span>{p.number}/{p.total} · {dateBR(p.due_date)}</span>
                          <span>{brl(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
