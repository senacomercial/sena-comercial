// Formatação pt-BR / BRL reutilizada em todos os módulos.

export const brl = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Number(value || 0))

export const dateBR = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export const today = () => new Date().toISOString().slice(0, 10)

// Dias até uma data (negativo = atrasado).
export const daysUntil = (value) => {
  if (!value) return null
  const d = new Date(value + 'T00:00:00')
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.round((d - now) / 86400000)
}
