import { useEffect, useMemo, useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { brl, today, dateBR } from '../../lib/format'
import { buildInstallments } from '../../lib/installments'
import { Button, Modal, Input, Select } from '../../components/ui'

// Formulário de projeto (criar/editar) com financeiro no nível do projeto.
// Gera as contas a receber: recorrentes (entram no MRR) ou parceladas.
export default function ProjetoForm({ open, onClose, editing, defaultClientId }) {
  const projects = useCollection('projects', { order: 'created_at' })
  const clients = useCollection('clients', { order: 'name', ascending: true })
  const categories = useCollection('categories', { order: 'name', ascending: true })
  const bills = useCollection('bills', { order: 'due_date', ascending: true })

  const blank = {
    name: '', client_id: defaultClientId || '', status: 'ativo', priority: 'media', deadline: today(), progress: 0,
    // financeiro
    has_receivable: false,
    receivable_value: '',
    is_recurring: true,
    recurrence: 'mensal',
    payment_start: today(),
    occurrences: '12',
    installments: '1',
    category_id: '',
    regenerate: true,
  }
  const [form, setForm] = useState(blank)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    if (editing) {
      const hasExistingReceivable = !!editing.receivable_value
      setForm({
        ...blank,
        name: editing.name, client_id: editing.client_id || '', status: editing.status,
        priority: editing.priority, deadline: editing.deadline || today(), progress: editing.progress || 0,
        has_receivable: hasExistingReceivable,
        receivable_value: editing.receivable_value ?? '',
        is_recurring: editing.is_recurring ?? true,
        recurrence: editing.recurrence || 'mensal',
        payment_start: editing.payment_start || today(),
        installments: String(editing.installments || 1),
        category_id: editing.category_id || '',
        // Se o projeto não tinha financeiro antes, regenerate começa true para criar bills
        regenerate: !hasExistingReceivable,
      })
    } else {
      setForm({ ...blank, client_id: defaultClientId || '' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editing])

  const incomeCats = useMemo(() => {
    const parents = categories.rows.filter((c) => !c.parent_id && c.type === 'income')
    const out = []
    for (const p of parents) {
      out.push({ id: p.id, label: p.name })
      categories.rows.filter((c) => c.parent_id === p.id).forEach((s) => out.push({ id: s.id, label: `  └ ${s.name}` }))
    }
    return out
  }, [categories.rows])

  // Prévia das contas a receber geradas.
  const preview = useMemo(() => {
    if (!form.has_receivable) return []
    const val = Number(form.receivable_value || 0)
    if (val <= 0) return []
    if (form.is_recurring) {
      const n = Math.max(1, parseInt(form.occurrences || '1', 10))
      return buildInstallments({ startDate: form.payment_start, installments: n, periodicity: form.recurrence, amountPerInstallment: val })
    }
    const n = Math.max(1, parseInt(form.installments || '1', 10))
    const per = Math.round((val / n) * 100) / 100
    const list = buildInstallments({ startDate: form.payment_start, installments: n, periodicity: 'mensal', amountPerInstallment: per })
    const diff = Math.round((val - per * n) * 100) / 100
    if (diff !== 0 && list.length) list[list.length - 1].amount = Math.round((per + diff) * 100) / 100
    return list
  }, [form])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        client_id: form.client_id || null,
        status: form.status,
        priority: form.priority,
        deadline: form.deadline || null,
        progress: Number(form.progress) || 0,
        receivable_value: form.has_receivable ? Number(form.receivable_value) : null,
        is_recurring: form.has_receivable ? form.is_recurring : false,
        recurrence: form.has_receivable && form.is_recurring ? form.recurrence : null,
        payment_start: form.has_receivable ? form.payment_start : null,
        installments: form.has_receivable && !form.is_recurring ? parseInt(form.installments, 10) : null,
        category_id: form.has_receivable ? (form.category_id || null) : null,
      }

      let project
      if (editing) project = await projects.update.mutateAsync({ id: editing.id, ...payload })
      else project = await projects.create.mutateAsync(payload)

      // Gera/atualiza contas a receber do projeto.
      const shouldGenerate = form.has_receivable && preview.length && project?.id && (!editing || form.regenerate)
      if (shouldGenerate) {
        // Remove contas anteriores deste projeto (apenas em aberto) ao regenerar.
        if (editing) {
          const existing = bills.rows.filter((b) => b.project_id === project.id && b.status !== 'pago')
          for (const b of existing) await bills.remove.mutateAsync(b.id)
        }
        const group = crypto.randomUUID()
        for (const p of preview) {
          await bills.create.mutateAsync({
            description: `${form.name} (${p.number}/${p.total})`,
            amount: p.amount,
            due_date: p.due_date,
            kind: 'receber',
            status: 'aberto',
            category_id: form.category_id || null,
            project_id: project.id,
            client_id: form.client_id || null,
            installment_number: p.number,
            installment_total: p.total,
            contract_group: group,
            is_recurring: form.is_recurring,
            recurrence: form.is_recurring ? form.recurrence : null,
            recurrence_group: form.is_recurring ? group : null,
          })
        }
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar projeto' : 'Novo projeto'}>
      <form onSubmit={save} className="space-y-3 max-h-[72vh] overflow-y-auto pr-1">
        <Input label="Nome do projeto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <Select label="Cliente" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
          <option value="">— Sem cliente —</option>
          {clients.rows.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
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

        {/* Financeiro do projeto */}
        <div className="rounded-lg border border-neutral-200 p-3">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={form.has_receivable}
              onChange={(e) => {
                const newVal = e.target.checked
                // Se está ativando recebimento durante edição, marca para regenerar
                setForm({ ...form, has_receivable: newVal, regenerate: editing && newVal ? true : form.regenerate })
              }}
            />
            Este projeto tem recebimento do cliente
          </label>

          {form.has_receivable && (
            <div className="mt-3 space-y-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_recurring} onChange={(e) => setForm({ ...form, is_recurring: e.target.checked })} />
                Recebimento recorrente (entra no MRR)
              </label>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label={form.is_recurring ? 'Valor por recebimento (R$)' : 'Valor total do contrato (R$)'}
                  type="number" step="0.01" value={form.receivable_value}
                  onChange={(e) => setForm({ ...form, receivable_value: e.target.value })} required
                />
                <Input label="Data do 1º recebimento" type="date" value={form.payment_start} onChange={(e) => setForm({ ...form, payment_start: e.target.value })} required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {form.is_recurring ? (
                  <>
                    <Select label="Frequência" value={form.recurrence} onChange={(e) => setForm({ ...form, recurrence: e.target.value })}>
                      <option value="diaria">Diária</option>
                      <option value="semanal">Semanal</option>
                      <option value="quinzenal">A cada 15 dias</option>
                      <option value="mensal">Mensal</option>
                    </Select>
                    <Input label="Quantas ocorrências gerar" type="number" min="1" value={form.occurrences} onChange={(e) => setForm({ ...form, occurrences: e.target.value })} />
                  </>
                ) : (
                  <Input label="Nº de parcelas" type="number" min="1" value={form.installments} onChange={(e) => setForm({ ...form, installments: e.target.value })} />
                )}
                <Select label="Categoria (receita)" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">— Sem categoria —</option>
                  {incomeCats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                </Select>
              </div>

              {editing && (
                <label className="flex items-center gap-2 text-sm text-neutral-600">
                  <input type="checkbox" checked={form.regenerate} onChange={(e) => setForm({ ...form, regenerate: e.target.checked })} />
                  Regenerar contas a receber (substitui as em aberto)
                </label>
              )}

              {preview.length > 0 && (!editing || form.regenerate) && (
                <div className="rounded-lg bg-neutral-50 p-2 text-xs">
                  <div className="mb-1 font-medium text-neutral-600">
                    {preview.length} recebimento(s) — total {brl(preview.reduce((s, p) => s + p.amount, 0))}
                  </div>
                  <div className="max-h-28 overflow-y-auto space-y-0.5">
                    {preview.slice(0, 24).map((p) => (
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
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</Button>
        </div>
      </form>
    </Modal>
  )
}
