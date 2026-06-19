import { useMemo, useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl, dateBR, today, daysUntil } from '../../lib/format'
import {
  Button, Card, Modal, Input, Select, Badge, PageHeader, EmptyState,
} from '../../components/ui'
import { buildInstallments } from '../../lib/installments'
import Categorias from './Categorias'

const TABS = [
  { id: 'lancamentos', label: 'Lançamentos' },
  { id: 'contas', label: 'Contas a pagar/receber' },
  { id: 'dividas', label: 'Dívidas' },
  { id: 'categorias', label: 'Categorias' },
]

export default function Financeiro() {
  const [tab, setTab] = useState('lancamentos')

  return (
    <div>
      <PageHeader title="Financeiro" subtitle="Receitas, despesas, contas e dívidas" />
      <div className="mb-6 flex gap-2 border-b border-neutral-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={
              'border-b-2 px-3 py-2 text-sm font-medium transition ' +
              (tab === t.id
                ? 'border-brand text-brand-dark'
                : 'border-transparent text-neutral-500 hover:text-neutral-800')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'lancamentos' && <Lancamentos />}
      {tab === 'contas' && <Contas />}
      {tab === 'dividas' && <Dividas />}
      {tab === 'categorias' && <Categorias />}
    </div>
  )
}

/* ---------------- Lançamentos (transações) ---------------- */
function Lancamentos() {
  const { rows, create, update, remove, isLoading } = useCollection('transactions', { order: 'date' })
  const { rows: categories } = useCollection('categories', { order: 'name', ascending: true })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const totals = useMemo(() => {
    let income = 0, expense = 0
    for (const r of rows) {
      if (r.type === 'income') income += Number(r.amount)
      else expense += Number(r.amount)
    }
    return { income, expense, balance: income - expense }
  }, [rows])

  const blank = { description: '', amount: '', type: 'income', date: today(), category: '', category_id: '', subcategory_id: '', status: 'pago' }
  const [form, setForm] = useState(blank)

  // Categorias-pai filtradas pelo tipo selecionado.
  const parentCats = useMemo(
    () => categories.filter((c) => !c.parent_id && c.type === form.type),
    [categories, form.type]
  )
  // Subcategorias da categoria-pai escolhida.
  const subCats = useMemo(
    () => categories.filter((c) => c.parent_id === form.category_id),
    [categories, form.category_id]
  )

  const openNew = () => { setEditing(null); setForm(blank); setOpen(true) }
  const openEdit = (r) => {
    setEditing(r)
    // Reconstrói a seleção de categoria/subcategoria a partir do category_id salvo.
    const cat = categories.find((c) => c.id === r.category_id)
    let category_id = '', subcategory_id = ''
    if (cat) {
      if (cat.parent_id) { category_id = cat.parent_id; subcategory_id = cat.id }
      else { category_id = cat.id }
    }
    setForm({ description: r.description, amount: r.amount, type: r.type, date: r.date, category: r.category || '', category_id, subcategory_id, status: r.status })
    setOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    // category_id final = subcategoria se escolhida, senão a categoria-pai.
    const finalCatId = form.subcategory_id || form.category_id || null
    const parentName = categories.find((c) => c.id === form.category_id)?.name || ''
    const subName = categories.find((c) => c.id === form.subcategory_id)?.name
    const categoryText = subName ? `${parentName} › ${subName}` : parentName
    const payload = {
      description: form.description,
      amount: Number(form.amount),
      type: form.type,
      date: form.date,
      status: form.status,
      category_id: finalCatId,
      category: categoryText, // texto usado nos gráficos do dashboard
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Receitas" value={brl(totals.income)} color="text-success" />
        <Kpi label="Despesas" value={brl(totals.expense)} color="text-danger" />
        <Kpi label="Saldo" value={brl(totals.balance)} color={totals.balance >= 0 ? 'text-success' : 'text-danger'} />
      </div>

      <div className="flex justify-end">
        <Button onClick={openNew}>+ Novo lançamento</Button>
      </div>

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhum lançamento ainda" hint="Registre sua primeira receita ou despesa." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Valor</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-neutral-100 last:border-0">
                  <td className="px-4 py-3 text-neutral-500">{dateBR(r.date)}</td>
                  <td className="px-4 py-3 font-medium">{r.description}</td>
                  <td className="px-4 py-3 text-neutral-500">{r.category || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge color={r.status === 'pago' ? 'green' : 'amber'}>{r.status}</Badge>
                  </td>
                  <td className={'px-4 py-3 text-right font-semibold ' + (r.type === 'income' ? 'text-success' : 'text-danger')}>
                    {r.type === 'income' ? '+' : '−'} {brl(r.amount)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(r)} className="text-neutral-400 hover:text-brand-dark">editar</button>
                    <button onClick={() => remove.mutate(r.id)} className="ml-3 text-neutral-400 hover:text-danger">excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar lançamento' : 'Novo lançamento'}>
        <form onSubmit={save} className="space-y-3">
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor (R$)" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input label="Data" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category_id: '', subcategory_id: '' })}>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </Select>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="pago">Pago</option>
              <option value="previsto">Previsto</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoria" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: '' })}>
              <option value="">— Sem categoria —</option>
              {parentCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
            <Select label="Subcategoria" value={form.subcategory_id} onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })} disabled={subCats.length === 0}>
              <option value="">{subCats.length === 0 ? '— (sem subcategorias) —' : '— Nenhuma —'}</option>
              {subCats.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
          {parentCats.length === 0 && (
            <p className="text-xs text-neutral-400">
              Nenhuma categoria de {form.type === 'income' ? 'receita' : 'despesa'} criada ainda. Crie na aba <strong>Categorias</strong>.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

/* ---------------- Contas a pagar/receber ---------------- */
function Contas() {
  const { rows, create, update, remove, isLoading } = useCollection('bills', { order: 'due_date', ascending: true })
  const { rows: categories } = useCollection('categories', { order: 'name', ascending: true })
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const blank = {
    description: '', amount: '', due_date: today(), kind: 'pagar', status: 'aberto',
    category_id: '',
    recurring: false, recurrence: 'mensal', occurrences: '12',
  }
  const [form, setForm] = useState(blank)

  const catOptions = useMemo(() => {
    const wantType = form.kind === 'receber' ? 'income' : 'expense'
    const parents = categories.filter((c) => !c.parent_id && c.type === wantType)
    const out = []
    for (const p of parents) {
      out.push({ id: p.id, label: p.name })
      categories.filter((c) => c.parent_id === p.id).forEach((s) => out.push({ id: s.id, label: `  └ ${s.name}` }))
    }
    return out
  }, [categories, form.kind])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const base = {
        description: form.description,
        amount: Number(form.amount),
        kind: form.kind,
        status: form.status,
        category_id: form.category_id || null,
      }
      if (form.recurring) {
        // Gera N ocorrências recorrentes a partir da data de vencimento.
        const n = Math.max(1, parseInt(form.occurrences || '1', 10))
        const group = crypto.randomUUID()
        const series = buildInstallments({
          startDate: form.due_date,
          installments: n,
          periodicity: form.recurrence,
          amountPerInstallment: Number(form.amount),
        })
        for (const p of series) {
          await create.mutateAsync({
            ...base,
            due_date: p.due_date,
            is_recurring: true,
            recurrence: form.recurrence,
            recurrence_group: group,
          })
        }
      } else {
        await create.mutateAsync({ ...base, due_date: form.due_date })
      }
      setOpen(false)
      setForm(blank)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => { setForm(blank); setOpen(true) }}>+ Nova conta</Button>
      </div>
      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhuma conta cadastrada" hint="Cadastre contas a pagar ou a receber com vencimento." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => {
            const d = daysUntil(r.due_date)
            const overdue = r.status === 'aberto' && d != null && d < 0
            return (
              <Card key={r.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {r.description}
                    {r.is_recurring && <Badge color="brand">↻ {r.recurrence}</Badge>}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {r.kind === 'pagar' ? 'A pagar' : 'A receber'} · vence {dateBR(r.due_date)}
                    {overdue && <span className="ml-2 text-danger font-medium">atrasada</span>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{brl(r.amount)}</div>
                  <div className="mt-1 flex items-center justify-end gap-2">
                    <Badge color={r.status === 'pago' ? 'green' : overdue ? 'red' : 'amber'}>{r.status === 'pago' ? 'pago' : 'aberto'}</Badge>
                    {r.status !== 'pago' && (
                      <button className="text-xs text-success hover:underline" onClick={() => update.mutate({ id: r.id, status: 'pago' })}>baixar</button>
                    )}
                    <button className="text-xs text-neutral-400 hover:text-danger" onClick={() => remove.mutate(r.id)}>excluir</button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova conta">
        <form onSubmit={save} className="space-y-3">
          <Input label="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor (R$)" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            <Input label={form.recurring ? 'Primeiro vencimento' : 'Vencimento'} type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Tipo" value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value, category_id: '' })}>
              <option value="pagar">A pagar</option>
              <option value="receber">A receber</option>
            </Select>
            <Select label="Categoria" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
              <option value="">— Sem categoria —</option>
              {catOptions.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </div>

          {/* Recorrência */}
          <div className="rounded-lg border border-neutral-200 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
              {form.kind === 'pagar' ? 'Pagamento recorrente' : 'Recebimento recorrente'}
            </label>
            {form.recurring && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Select label="Frequência" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })}>
                  <option value="diaria">Diária</option>
                  <option value="semanal">Semanal</option>
                  <option value="quinzenal">A cada 15 dias</option>
                  <option value="mensal">Mensal</option>
                </Select>
                <Input label="Quantas ocorrências" type="number" min="1" value={form.occurrences} onChange={(e) => setForm({ ...form, occurrences: e.target.value })} />
              </div>
            )}
            {form.recurring && (
              <p className="mt-2 text-xs text-neutral-400">
                Serão criadas {form.occurrences || 0} contas de {brl(Number(form.amount || 0))} cada.
              </p>
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

/* ---------------- Dívidas ---------------- */
function Dividas() {
  const { rows, create, remove, update, isLoading } = useCollection('debts', { order: 'created_at' })
  const [open, setOpen] = useState(false)
  const blank = { creditor: '', total: '', balance: '', installments: '', next_due: '' }
  const [form, setForm] = useState(blank)

  const totalDebt = useMemo(() => rows.reduce((s, r) => s + Number(r.balance || 0), 0), [rows])

  const save = async (e) => {
    e.preventDefault()
    await create.mutateAsync({
      ...form,
      total: Number(form.total),
      balance: Number(form.balance || form.total),
      installments: form.installments ? Number(form.installments) : null,
      next_due: form.next_due || null,
    })
    setOpen(false)
    setForm(blank)
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Kpi label="Saldo devedor total" value={brl(totalDebt)} color="text-danger" />
      </div>
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}>+ Nova dívida</Button>
      </div>
      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhuma dívida cadastrada" hint="Que ótimo! Ou registre para acompanhar a quitação." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r) => {
            const pct = r.total ? Math.min(100, Math.round((1 - r.balance / r.total) * 100)) : 0
            return (
              <Card key={r.id}>
                <div className="flex items-start justify-between">
                  <div className="font-medium">{r.creditor}</div>
                  <button className="text-xs text-neutral-400 hover:text-danger" onClick={() => remove.mutate(r.id)}>excluir</button>
                </div>
                <div className="mt-1 text-sm text-neutral-500">
                  Saldo {brl(r.balance)} de {brl(r.total)}
                  {r.installments ? ` · ${r.installments}x` : ''}
                  {r.next_due ? ` · próx. ${dateBR(r.next_due)}` : ''}
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-neutral-100">
                  <div className="h-2 rounded-full bg-success" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 text-xs text-neutral-400">{pct}% quitado</div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Nova dívida">
        <form onSubmit={save} className="space-y-3">
          <Input label="Credor" value={form.creditor} onChange={(e) => setForm({ ...form, creditor: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor total (R$)" type="number" step="0.01" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} required />
            <Input label="Saldo devedor (R$)" type="number" step="0.01" value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Parcelas" type="number" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} />
            <Input label="Próximo vencimento (opcional)" type="date" value={form.next_due} onChange={(e) => setForm({ ...form, next_due: e.target.value })} />
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

function Kpi({ label, value, color }) {
  return (
    <Card>
      <div className="text-sm text-neutral-500">{label}</div>
      <div className={'mt-1 text-2xl font-semibold ' + (color || '')}>{value}</div>
    </Card>
  )
}
