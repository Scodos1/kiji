export function Spinner({ className = '' }) {
  return (
    <div
      className={`h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600 ${className}`}
    />
  )
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ...props
}) {
  const styles = {
    primary:
      'bg-brand-700 text-white hover:bg-brand-800 disabled:bg-slate-300',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-50',
    ghost: 'text-brand-700 hover:bg-brand-50 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({
  label,
  error,
  className = '',
  type = 'text',
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <input
        type={type}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
          error ? 'border-red-300' : 'border-slate-200'
        } ${className}`}
        {...props}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Select({ label, options, error, className = '', ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </span>
      )}
      <select
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
          error ? 'border-red-300' : 'border-slate-200'
        } ${className}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

export function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-slate-100 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function StatCard({ label, value, change, sub, icon }) {
  const positive = change != null && change >= 0
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>
        {icon && (
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
            {icon}
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {change != null && (
          <span
            className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold ${
              positive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {positive ? '+' : ''}{Math.abs(change)}%
          </span>
        )}
        {sub && <span className="text-xs text-slate-400">{sub}</span>}
      </div>
    </Card>
  )
}

export function Badge({ color, children }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium ${color}`}
    >
      {children}
    </span>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full overflow-y-auto rounded-t-lg bg-white p-6 shadow-xl sm:max-w-lg sm:rounded-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded text-slate-400 hover:bg-slate-100"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
        --
      </div>
      <h3 className="font-display text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'bg-brand-50 text-brand-900 border-brand-100',
    success: 'bg-emerald-50 text-emerald-900 border-emerald-100',
    warning: 'bg-amber-50 text-amber-900 border-amber-100',
    danger: 'bg-red-50 text-red-900 border-red-100',
  }
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  )
}
