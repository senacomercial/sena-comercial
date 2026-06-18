import { useMemo, useState } from 'react'
import { useCollection } from '../../lib/useCollection'
import { Button, Card, Modal, Input, Select, Badge, PageHeader, EmptyState } from '../../components/ui'

// Gestão de categorias e subcategorias personalizáveis (receita/despesa).
export default function Categorias() {
  const { rows, create, update, remove, isLoading } = useCollection('categories', { order: 'name', ascending: true })
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const blank = { name: '', type: 'expense', parent_id: '', color: '#b8893a' }
  const [form, setForm] = useState(blank)

  // Agrupa em árvore: categorias-pai com suas subcategorias.
  const tree = useMemo(() => {
    const parents = rows.filter((c) => !c.parent_id)
    return parents.map((p) => ({
      ...p,
      children: rows.filter((c) => c.parent_id === p.id),
    }))
  }, [rows])

  const parentOptions = useMemo(
    () => rows.filter((c) => !c.parent_id),
    [rows]
  )

  const openNew = (presetType) => {
    setEditing(null)
    setForm({ ...blank, type: presetType || 'expense' })
    setOpen(true)
  }
  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, type: c.type, parent_id: c.parent_id || '', color: c.color || '#b8893a' })
    setOpen(true)
  }

  const save = async (e) => {
    e.preventDefault()
    const payload = {
      name: form.name,
      type: form.type,
      parent_id: form.parent_id || null,
      color: form.color,
    }
    if (editing) await update.mutateAsync({ id: editing.id, ...payload })
    else await create.mutateAsync(payload)
    setOpen(false)
    setForm(blank)
  }

  // Se virou subcategoria, herda o tipo do pai.
  const onParentChange = (parentId) => {
    const parent = rows.find((c) => c.id === parentId)
    setForm((f) => ({ ...f, parent_id: parentId, type: parent ? parent.type : f.type }))
  }

  const receitas = tree.filter((c) => c.type === 'income')
  const despesas = tree.filter((c) => c.type === 'expense')

  return (
    <div>
      <PageHeader
        title="Categorias"
        subtitle="Organize receitas e despesas com categorias e subcategorias"
        action={<Button onClick={() => openNew()}>+ Nova categoria</Button>}
      />

      {isLoading ? (
        <p className="text-neutral-400">Carregando…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Nenhuma categoria ainda" hint="Crie categorias e subcategorias do seu jeito." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryColumn
            title="Receitas"
            color="green"
            items={receitas}
            onAdd={() => openNew('income')}
            onEdit={openEdit}
            onRemove={(id) => remove.mutate(id)}
            onAddSub={(parent) => { setEditing(null); setForm({ ...blank, type: parent.type, parent_id: parent.id }); setOpen(true) }}
          />
          <CategoryColumn
            title="Despesas"
            color="red"
            items={despesas}
            onAdd={() => openNew('expense')}
            onEdit={openEdit}
            onRemove={(id) => remove.mutate(id)}
            onAddSub={(parent) => { setEditing(null); setForm({ ...blank, type: parent.type, parent_id: parent.id }); setOpen(true) }}
          />
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Editar categoria' : 'Nova categoria'}>
        <form onSubmit={save} className="space-y-3">
          <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ex: Marketing, Salários…" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Categoria-pai (opcional)" value={form.parent_id} onChange={(e) => onParentChange(e.target.value)}>
              <option value="">— Nenhuma (categoria principal) —</option>
              {parentOptions
                .filter((p) => !editing || p.id !== editing.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.type === 'income' ? 'receita' : 'despesa'})</option>
                ))}
            </Select>
            <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={!!form.parent_id}>
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-neutral-600">Cor</label>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-9 w-16 rounded border border-neutral-300" />
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

function CategoryColumn({ title, color, items, onAdd, onEdit, onRemove, onAddSub }) {
  return (
    <Card className="p-0">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <Badge color={color}>{title}</Badge>
          <span className="text-sm text-neutral-400">{items.length}</span>
        </div>
        <button onClick={onAdd} className="text-sm text-brand-dark hover:underline">+ adicionar</button>
      </div>
      {items.length === 0 ? (
        <p className="p-4 text-sm text-neutral-400">Nenhuma categoria de {title.toLowerCase()}.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {items.map((cat) => (
            <li key={cat.id} className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color || '#ccc' }} />
                  <span className="font-medium">{cat.name}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <button onClick={() => onAddSub(cat)} className="text-brand-dark hover:underline">+ sub</button>
                  <button onClick={() => onEdit(cat)} className="text-neutral-400 hover:text-brand-dark">editar</button>
                  <button onClick={() => onRemove(cat.id)} className="text-neutral-400 hover:text-danger">excluir</button>
                </div>
              </div>
              {cat.children.length > 0 && (
                <ul className="mt-2 ml-5 space-y-1 border-l border-neutral-200 pl-3">
                  {cat.children.map((sub) => (
                    <li key={sub.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sub.color || '#ccc' }} />
                        <span className="text-neutral-600">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <button onClick={() => onEdit(sub)} className="text-neutral-400 hover:text-brand-dark">editar</button>
                        <button onClick={() => onRemove(sub.id)} className="text-neutral-400 hover:text-danger">excluir</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
