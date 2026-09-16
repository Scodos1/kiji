import { useEffect, useState } from 'react'
import api from '../api/client'
import { Button, Card, Input, Modal, Spinner, EmptyState, Badge } from '../components/ui'
import { naira, relativeTime, statusMeta } from '../utils/format'
import { firstError } from '../utils/errors'

const waNumber = (phone) => {
  const digits = (phone || '').replace(/\D/g, '')
  if (digits.startsWith('234')) return digits
  if (digits.startsWith('0')) return `234${digits.slice(1)}`
  if (digits.length === 10) return `234${digits}`
  return digits
}

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [segments, setSegments] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({ name: '', phone: '', email: '' })

  const loadData = async (q = '') => {
    const [c, s] = await Promise.all([
      api.get('/customers/', { params: q ? { search: q } : {} }),
      api.get('/analytics/customers/'),
    ])
    setCustomers(c.data.results || c.data)
    setSegments(s.data)
    setLoading(false)
  }

  useEffect(() => {
    const t = setTimeout(() => loadData(search), 300)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', phone: '', email: '' })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (c) => {
    setEditing(c)
    setForm({ name: c.name, phone: c.phone, email: c.email })
    setError('')
    setModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/customers/${editing.id}/`, form)
      } else {
        await api.post('/customers/', form)
      }
      setModalOpen(false)
      setEditing(null)
      setForm({ name: '', phone: '', email: '' })
      await loadData()
    } catch (err) {
      setError(firstError(err.response?.data, 'Could not save customer.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this customer? Their sales history stays on record.')) return
    await api.delete(`/customers/${id}/`)
    setSelected(null)
    await loadData()
  }

  const seg = [
    { key: 'active', label: 'Total Active' },
    { key: 'at_risk', label: 'At Risk' },
    { key: 'inactive', label: 'Inactive' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Track your customers and their purchases</p>
        </div>
        <Button onClick={openAdd} className="!px-5">
          + Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-lg lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Total Customers</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">
            {Object.values(segments).reduce((a, s) => a + (s?.count || 0), 0)}
          </p>
        </Card>
        {seg.map((s) => (
          <Card key={s.key} className="p-5">
            <p className="text-sm font-medium text-slate-500">{s.label}</p>
            <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">
              {segments[s.key]?.count || 0}
            </p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="border-b border-slate-100 p-4">
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : customers.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No customers yet"
              message="Add your customers and their purchases will build up their profiles automatically."
              action={<Button onClick={() => setModalOpen(true)}>+ Add Customer</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Purchases</th>
                  <th className="px-5 py-3 font-semibold">Total Spent</th>
                  <th className="px-5 py-3 font-semibold">Last Purchase</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => {
                  const meta = statusMeta[c.status] || statusMeta.inactive
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelected(c)}
                      className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-5 py-3">
                        <p className="font-medium text-slate-800">{c.name}</p>
                        <p className="text-xs text-slate-400">{c.phone || 'No phone'}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{c.total_purchases}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{naira(c.total_spent)}</td>
                      <td className="px-5 py-3 text-slate-500">{relativeTime(c.last_purchase)}</td>
                      <td className="px-5 py-3">
                        <Badge color={meta.color}>
                          {meta.dot} {meta.label}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input
            label="Phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="08012345678"
          />
          <Input
            label="Email (optional)"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Customer'}
          </Button>
        </form>
      </Modal>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Purchases</p>
                <p className="mt-1 font-display text-xl font-bold text-slate-900">{selected.total_purchases}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Total Spent</p>
                <p className="mt-1 font-display text-xl font-bold text-slate-900">{naira(selected.total_spent)}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">Last Purchase</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{relativeTime(selected.last_purchase)}</p>
              </div>
            </div>
            <p className="text-sm text-slate-500">
              {selected.phone && <>Phone: {selected.phone}<br /></>}
              {selected.email && <>Email: {selected.email}</>}
            </p>
            {selected.phone && (
              <a
                href={`https://wa.me/${waNumber(selected.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Message on WhatsApp
              </a>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const c = selected
                  setSelected(null)
                  openEdit(c)
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Edit details
              </button>
              <button
                onClick={() => remove(selected.id)}
                className="flex-1 rounded-lg border border-red-100 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
