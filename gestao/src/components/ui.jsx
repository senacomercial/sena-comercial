import { useEffect } from 'react'

const cx = (...c) => c.filter(Boolean).join(' ')

export function Button({ variant = 'primary', className, ...props }) {
  const styles = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100',
    outline: 'border border-neutral-300 text-neutral-700 hover:bg-neutral-50',
    danger: 'bg-danger text-white hover:opacity-90',
  }[variant]
  return (
    <button
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed',
        styles,
        className
      )}
      {...props}
    />
  )
}

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cx('rounded-xl border border-neutral-200 bg-white p-4 shadow-sm', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-sm font-medium text-neutral-600">{label}</span>}
      {children}
    </label>
  )
}

const baseInput =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'

export function Input({ label, className, ...props }) {
  return (
    <Field label={label}>
      <input className={cx(baseInput, className)} {...props} />
    </Field>
  )
}

export function Textarea({ label, className, ...props }) {
  return (
    <Field label={label}>
      <textarea className={cx(baseInput, 'min-h-[80px]', className)} {...props} />
    </Field>
  )
}

export function Select({ label, children, className, ...props }) {
  return (
    <Field label={label}>
      <select className={cx(baseInput, className)} {...props}>
        {children}
      </select>
    </Field>
  )
}

const badgeColors = {
  neutral: 'bg-neutral-100 text-neutral-700',
  green: 'bg-success/15 text-success',
  red: 'bg-danger/15 text-danger',
  amber: 'bg-warning/20 text-warning',
  brand: 'bg-brand/15 text-brand-dark',
}

export function Badge({ color = 'neutral', children }) {
  return (
    <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', badgeColors[color])}>
      {children}
    </span>
  )
}

export function Modal({ open, onClose, title, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, hint }) {
  return (
    <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
      <p className="font-medium text-neutral-600">{title}</p>
      {hint && <p className="mt-1 text-sm text-neutral-400">{hint}</p>}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
