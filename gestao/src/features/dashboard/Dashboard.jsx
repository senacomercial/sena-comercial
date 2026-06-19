import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { useCollection } from '../../lib/useCollection'
import { brl, daysUntil } from '../../lib/format'
import { Card, PageHeader, Badge } from '../../components/ui'

export default function Dashboard() {
  const tx = useCollection('transactions', { order: 'date' })
  const bills = useCollection('bills', { order: 'due_date', ascending: true })
  const leads = useCollection('leads', { order: 'created_at' })
  const tasks = useCollection('tasks', { order: 'due_date', ascending: true })
  const goals = useCollection('goals', { order: 'deadline', ascending: true })

  const fin = useMemo(() => {
    let income = 0, expense = 0
    for (const r of tx.rows) {
      if (r.type === 'income') income += Number(r.amount)
      else expense += Number(r.amount)
    }
    return { income, expense, balance: income - expense }
  }, [tx.rows])

  const aPagar = useMemo(
    () => bills.rows.filter((b) => b.status !== 'pago' && b.kind === 'pagar').reduce((s, b) => s + Number(b.amount), 0),
    [bills.rows]
  )

  const pipeline = useMemo(
    () => leads.rows.filter((l) => !['ganho', 'perdido'].includes(l.stage)).reduce((s, l) => s + Number(l.estimated_value || 0), 0),
    [leads.rows]
  )

  const tarefasVencendo = useMemo(
    () => tasks.rows.filter((t) => t.status !== 'feito' && t.due_date && daysUntil(t.due_date) <= 3),
    [tasks.rows]
  )

  const tarefasAtrasadas = useMemo(
    () => tasks.rows.filter((t) => t.status !== 'feito' && t.due_date && daysUntil(t.due_date) < 0),
    [tasks.rows]
  )

  const contasAtrasadas = useMemo(
    () => bills.rows.filter((b) => b.status !== 'pago' && daysUntil(b.due_date) < 0),
    [bills.rows]
  )

  // Despesas por categoria
  const categoryBreakdown = useMemo(() => {
    const cats = {}
    for (const t of tx.rows) {
      if (t.type === 'expense' && t.category) {
        if (!cats[t.category]) cats[t.category] = 0
        cats[t.category] += Number(t.amount || 0)
      }
    }
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [tx.rows])

  const COLORS = ['#b8893a', '#d4493f', '#1f9d61', '#d99a16', '#6366f1', '#f59e0b']

  // Receita x Despesa por mês (últimos 6 meses).
  const chartData = useMemo(() => {
    const map = {}
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleDateString('pt-BR', { month: 'short' })
      map[`${d.getFullYear()}-${d.getMonth()}`] = { mes: key, Receita: 0, Despesa: 0 }
    }
    for (const r of tx.rows) {
      const d = new Date(r.date + 'T00:00:00')
      const k = `${d.getFullYear()}-${d.getMonth()}`
      if (map[k]) {
        if (r.type === 'income') map[k].Receita += Number(r.amount)
        else map[k].Despesa += Number(r.amount)
      }
    }
    return Object.values(map)
  }, [tx.rows])

  // ---- Fluxo de caixa diário acumulado (com seletor de período) ----
  const [period, setPeriod] = useState('p30')
  const PERIODS = [
    { id: 'semana', label: 'Semana' },
    { id: 'mes', label: 'Mês' },
    { id: 'p30', label: 'Próx. 30 dias' },
    { id: 'p90', label: 'Próx. 3 meses' },
    { id: 'p180', label: 'Próx. 6 meses' },
  ]

  const range = useMemo(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const iso = (d) => d.toISOString().slice(0, 10)
    let start, end
    if (period === 'semana') {
      start = new Date(now); start.setDate(now.getDate() - 6)
      end = now
    } else if (period === 'mes') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else {
      const days = period === 'p30' ? 30 : period === 'p90' ? 90 : 180
      start = now
      end = new Date(now); end.setDate(now.getDate() + days)
    }
    return { start: iso(start), end: iso(end) }
  }, [period])

  // Série diária acumulada: transações realizadas + contas (bills) em aberto projetadas.
  const dailyFlow = useMemo(() => {
    const { start, end } = range
    const iso = (d) => d.toISOString().slice(0, 10)

    // Saldo inicial = transações antes do início + contas vencidas em aberto antes do início.
    let baseline = 0
    for (const t of tx.rows) {
      if (t.date < start) baseline += t.type === 'income' ? Number(t.amount) : -Number(t.amount)
    }
    for (const b of bills.rows) {
      if (b.status !== 'pago' && b.due_date < start) {
        baseline += b.kind === 'receber' ? Number(b.amount) : -Number(b.amount)
      }
    }

    // Net por dia dentro do período.
    const netByDay = {}
    for (const t of tx.rows) {
      if (t.date >= start && t.date <= end) {
        netByDay[t.date] = (netByDay[t.date] || 0) + (t.type === 'income' ? Number(t.amount) : -Number(t.amount))
      }
    }
    for (const b of bills.rows) {
      if (b.status !== 'pago' && b.due_date >= start && b.due_date <= end) {
        netByDay[b.due_date] = (netByDay[b.due_date] || 0) + (b.kind === 'receber' ? Number(b.amount) : -Number(b.amount))
      }
    }

    const out = []
    let acc = baseline
    const cur = new Date(start + 'T00:00:00')
    const last = new Date(end + 'T00:00:00')
    while (cur <= last) {
      const key = iso(cur)
      acc += netByDay[key] || 0
      out.push({
        dia: cur.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        Saldo: Math.round(acc * 100) / 100,
      })
      cur.setDate(cur.getDate() + 1)
    }
    return out
  }, [tx.rows, bills.rows, range])

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Visão geral da SENA COMERCIAL" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi to="/financeiro" label="Saldo" value={brl(fin.balance)} color={fin.balance >= 0 ? 'text-success' : 'text-danger'} />
        <Kpi to="/financeiro" label="Receitas" value={brl(fin.income)} color="text-success" />
        <Kpi to="/financeiro" label="Despesas" value={brl(fin.expense)} color="text-danger" />
        <Kpi to="/crm" label="Pipeline" value={brl(pipeline)} color="text-brand-dark" />
        <Kpi to="/tarefas" label="Atrasadas" value={String(tarefasAtrasadas.length)} color={tarefasAtrasadas.length > 0 ? 'text-danger' : ''} />
      </div>

      {/* Fluxo de caixa acumulado (diário) */}
      <div className="mt-6">
        <Card className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-neutral-200">
            <span className="font-medium">Fluxo de caixa acumulado</span>
            <div className="flex flex-wrap gap-1">
              {PERIODS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={
                    'rounded-lg px-2.5 py-1 text-xs font-medium transition ' +
                    (period === p.id ? 'bg-brand text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200')
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="dia" fontSize={11} interval="preserveStartEnd" minTickGap={24} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => brl(v)} />
                <Line type="monotone" dataKey="Saldo" stroke="#b8893a" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Fluxo de caixa */}
        <Card className="lg:col-span-2 p-0">
          <div className="px-4 py-3 border-b border-neutral-200 font-medium">Receita × Despesa (6 meses)</div>
          <div className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip formatter={(v) => brl(v)} />
                <Legend />
                <Bar dataKey="Receita" fill="#1f9d61" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesa" fill="#d4493f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Próximas tarefas */}
        <Card>
          <div className="mb-3 font-medium">Próximas tarefas</div>
          {tarefasVencendo.length === 0 ? (
            <p className="text-sm text-neutral-400">Nada vencendo nos próximos dias. 🎉</p>
          ) : (
            <ul className="space-y-2">
              {tarefasVencendo.slice(0, 6).map((t) => {
                const d = daysUntil(t.due_date)
                return (
                  <li key={t.id} className="flex items-center justify-between text-sm">
                    <span className="truncate">{t.title}</span>
                    <Badge color={d < 0 ? 'red' : 'amber'}>{d < 0 ? 'atrasada' : `${d}d`}</Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Despesas por categoria */}
      {categoryBreakdown.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-0">
            <div className="px-4 py-3 border-b border-neutral-200 font-medium">Despesas por categoria</div>
            <div className="h-72 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${brl(value)}`}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryBreakdown.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => brl(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Alertas */}
          <div className="space-y-3">
            {tarefasAtrasadas.length > 0 && (
              <Card className="border-l-4 border-danger bg-danger/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <p className="text-xs text-neutral-600">Tarefas atrasadas</p>
                    <p className="text-xl font-semibold text-danger">{tarefasAtrasadas.length}</p>
                  </div>
                </div>
              </Card>
            )}
            {contasAtrasadas.length > 0 && (
              <Card className="border-l-4 border-warning bg-warning/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <p className="text-xs text-neutral-600">Contas vencidas</p>
                    <p className="text-xl font-semibold text-warning">{brl(contasAtrasadas.reduce((s, b) => s + Number(b.amount), 0))}</p>
                  </div>
                </div>
              </Card>
            )}
            {leads.rows.filter((l) => l.stage === 'negociacao').length > 0 && (
              <Card className="border-l-4 border-brand bg-brand/5">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔥</span>
                  <div>
                    <p className="text-xs text-neutral-600">Em negociação</p>
                    <p className="text-xl font-semibold text-brand-dark">{leads.rows.filter((l) => l.stage === 'negociacao').length}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <Card>
          <div className="mb-3 font-medium">Progresso das metas</div>
          {goals.rows.length === 0 ? (
            <p className="text-sm text-neutral-400">
              Nenhuma meta ainda. <Link to="/metas" className="text-brand-dark hover:underline">Definir metas →</Link>
            </p>
          ) : (
            <div className="space-y-3">
              {goals.rows.slice(0, 5).map((g) => {
                const pct = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm">
                      <span>{g.title}</span>
                      <span className="text-neutral-400">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-neutral-100">
                      <div className="h-2 rounded-full bg-brand" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function Kpi({ label, value, color, to }) {
  const inner = (
    <Card className="transition hover:shadow-md">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className={'mt-1 text-2xl font-semibold ' + (color || '')}>{value}</div>
    </Card>
  )
  return to ? <Link to={to}>{inner}</Link> : inner
}
