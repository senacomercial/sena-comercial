// Geração de parcelas conforme periodicidade.

export const PERIODICITIES = [
  { id: 'diaria', label: 'Diária', days: 1 },
  { id: 'semanal', label: 'Semanal', days: 7 },
  { id: 'quinzenal', label: 'Quinzenal (a cada 15 dias)', days: 15 },
  { id: 'mensal', label: 'Mensal', months: 1 },
  { id: 'bimestral', label: 'Bimestral', months: 2 },
  { id: 'trimestral', label: 'Trimestral', months: 3 },
  { id: 'semestral', label: 'Semestral', months: 6 },
  { id: 'anual', label: 'Anual', months: 12 },
]

// Fator de normalização para faturamento mensal (MRR) por frequência.
export const MONTHLY_FACTOR = {
  diaria: 30,
  semanal: 52 / 12,   // ~4.333 semanas por mês
  quinzenal: 2,
  mensal: 1,
  bimestral: 1 / 2,
  trimestral: 1 / 3,
  semestral: 1 / 6,
  anual: 1 / 12,
}

// Soma um intervalo de periodicidade a uma data (string yyyy-mm-dd) e retorna yyyy-mm-dd.
export function addPeriod(dateStr, periodicityId, count) {
  const p = PERIODICITIES.find((x) => x.id === periodicityId)
  const d = new Date(dateStr + 'T00:00:00')
  if (!p) return dateStr
  if (p.days) {
    d.setDate(d.getDate() + p.days * count)
  } else if (p.months) {
    d.setMonth(d.getMonth() + p.months * count)
  }
  return d.toISOString().slice(0, 10)
}

// Gera array de parcelas: [{ number, total, due_date, amount }]
export function buildInstallments({ startDate, installments, periodicity, amountPerInstallment }) {
  const list = []
  for (let i = 0; i < installments; i++) {
    list.push({
      number: i + 1,
      total: installments,
      due_date: addPeriod(startDate, periodicity, i),
      amount: amountPerInstallment,
    })
  }
  return list
}
