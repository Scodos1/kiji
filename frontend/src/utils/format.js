export const naira = (value) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

export const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const relativeTime = (iso) => {
  if (!iso) return 'Never'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export const statusMeta = {
  active: { label: 'Active', color: 'bg-emerald-50 text-emerald-700', dot: '🟢' },
  at_risk: { label: 'At Risk', color: 'bg-amber-50 text-amber-700', dot: '🟡' },
  inactive: { label: 'Inactive', color: 'bg-slate-100 text-slate-600', dot: '🔴' },
}
