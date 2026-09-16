import { useEffect, useState } from 'react'
import api from '../api/client'
import { Button, Card, Input, Select, Modal, Spinner, EmptyState } from '../components/ui'
import { naira, formatDate } from '../utils/format'
import { firstError } from '../utils/errors'

const PAYMENT_OPTIONS = [
  { value: 'cash', label: 'Cash' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'pos', label: 'POS' },
  { value: 'other', label: 'Other' },
]

export default function Sales() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [monthTotal, setMonthTotal] = useState(0)
  const [todayTotal, setTodayTotal] = useState(0)

  const [form, setForm] = useState({
    product: '',
    customer: '',
    quantity: 1,
    unit_price: '',
    payment_method: 'cash',
  })

  const loadData = async () => {
    const [s, p, c, o] = await Promise.all([
      api.get('/sales/'),
      api.get('/products/'),
      api.get('/customers/'),
      api.get('/analytics/overview/'),
    ])
    setSales(s.data.results || s.data)
    setProducts(p.data.results || p.data)
    setCustomers(c.data.results || c.data)
    setMonthTotal(o.data.revenue)
    const lagosDay = (iso) =>
      new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Africa/Lagos' })
    const today = lagosDay(new Date().toISOString())
    const todaySales = (s.data.results || s.data).filter(
      (x) => x.sale_date && lagosDay(x.sale_date) === today,
    )
    setTodayTotal(todaySales.reduce((sum, x) => sum + Number(x.total_amount), 0))
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const selectProduct = (id) => {
    const p = products.find((x) => x.id === Number(id))
    setForm((f) => ({ ...f, product: id, unit_price: p ? p.selling_price : f.unit_price }))
  }

  const total = (Number(form.unit_price) || 0) * (Number(form.quantity) || 1)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        product: form.product || null,
        customer: form.customer || null,
        quantity: form.quantity,
        unit_price: form.unit_price,
        payment_method: form.payment_method,
        sale_date: new Date().toISOString(),
      }
      await api.post('/sales/', payload)
      setModalOpen(false)
      setForm({ product: '', customer: '', quantity: 1, unit_price: '', payment_method: 'cash' })
      await loadData()
    } catch (err) {
      setError(firstError(err.response?.data, 'Could not record sale.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this sale?')) return
    await api.delete(`/sales/${id}/`)
    await loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Sales</h1>
          <p className="text-sm text-slate-500">Record and review your sales</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="!px-5">
          + Record Sale
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">Today’s Sales</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">{naira(todayTotal)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-slate-500">This Month</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">{naira(monthTotal)}</p>
        </Card>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : sales.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No sales yet"
              message="              Record your first sale. It takes under 10 seconds."
              action={<Button onClick={() => setModalOpen(true)}>+ Record Sale</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Qty</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="px-5 py-3 text-slate-500">{formatDate(s.sale_date)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800">
                      {s.customer_name || 'Walk-in'}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.product_name || '-'}</td>
                    <td className="px-5 py-3 text-slate-600">{s.quantity}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">{naira(s.total_amount)}</td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600">
                        {s.payment_method}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => remove(s.id)}
                        className="text-xs font-medium text-slate-300 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record New Sale">
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Customer"
            value={form.customer}
            options={[{ value: '', label: 'Walk-in customer' }, ...customers.map((c) => ({ value: c.id, label: c.name }))]}
            onChange={(e) => setForm({ ...form, customer: e.target.value })}
          />
          <Select
            label="Product / service"
            value={form.product}
            options={[{ value: '', label: 'Select product' }, ...products.map((p) => ({ value: p.id, label: p.name }))]}
            onChange={(e) => selectProduct(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity"
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              inputMode="numeric"
              required
            />
            <Input
              label="Price (₦)"
              type="number"
              value={form.unit_price}
              onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
              inputMode="numeric"
              placeholder="0"
              required
            />
          </div>
          <Select
            label="Payment method"
            value={form.payment_method}
            options={PAYMENT_OPTIONS}
            onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
          />
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">Total</span>
            <span className="font-display text-lg font-bold text-slate-900">{naira(total)}</span>
          </div>
          {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : 'Record Sale'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
