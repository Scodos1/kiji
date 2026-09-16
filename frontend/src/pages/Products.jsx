import { useEffect, useState } from 'react'
import api from '../api/client'
import { Button, Card, Input, Modal, Spinner, EmptyState } from '../components/ui'
import { naira } from '../utils/format'
import { firstError } from '../utils/errors'

export default function Products() {
  const [products, setProducts] = useState([])
  const [performance, setPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    name: '',
    selling_price: '',
    cost_price: '',
    stock_quantity: '',
  })

  const loadData = async () => {
    const [p, perf] = await Promise.all([
      api.get('/products/'),
      api.get('/analytics/products/'),
    ])
    setProducts(p.data.results || p.data)
    setPerformance(perf.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', selling_price: '', cost_price: '', stock_quantity: '' })
    setModalOpen(true)
  }

  const openEdit = (p) => {
    setEditing(p)
    setForm({
      name: p.name,
      selling_price: p.selling_price,
      cost_price: p.cost_price,
      stock_quantity: p.stock_quantity,
    })
    setModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const payload = {
      name: form.name,
      selling_price: form.selling_price,
      cost_price: form.cost_price === '' ? 0 : form.cost_price,
      stock_quantity: form.stock_quantity === '' ? 0 : form.stock_quantity,
    }
    try {
      if (editing) {
        await api.patch(`/products/${editing.id}/`, payload)
      } else {
        await api.post('/products/', payload)
      }
      setModalOpen(false)
      await loadData()
    } catch (err) {
      setError(firstError(err.response?.data, 'Could not save product.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}/`)
    await loadData()
  }

  const perfMap = Object.fromEntries(performance.map((p) => [p.product, p]))
  const margin = (sell, cost) => {
    const s = Number(sell)
    const c = Number(cost)
    if (!s) return null
    return Math.round(((s - c) / s) * 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">Your products and services</p>
        </div>
        <Button onClick={openAdd} className="!px-5">
          + Add Product
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : products.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No products yet"
              message="Add what you sell so you can record sales quickly and see what earns you the most."
              action={<Button onClick={openAdd}>+ Add Product</Button>}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-semibold">Product</th>
                  <th className="px-5 py-3 font-semibold">Selling Price</th>
                  <th className="px-5 py-3 font-semibold">Cost Price</th>
                  <th className="px-5 py-3 font-semibold">Margin</th>
                  <th className="px-5 py-3 font-semibold">Units Sold</th>
                  <th className="px-5 py-3 font-semibold">Revenue</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const perf = perfMap[p.name]
                  const m = margin(p.selling_price, p.cost_price)
                  return (
                    <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-5 py-3 text-slate-600">{naira(p.selling_price)}</td>
                      <td className="px-5 py-3 text-slate-600">{naira(p.cost_price)}</td>
                      <td className="px-5 py-3">
                        {m != null && (
                          <span className={`rounded px-2.5 py-1 text-xs font-semibold ${m >= 30 ? 'bg-emerald-50 text-emerald-700' : m >= 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-600'}`}>
                            {m}%
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{perf?.units_sold || 0}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{naira(perf?.revenue || 0)}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => openEdit(p)} className="text-xs font-medium text-brand-600 hover:underline">
                          Edit
                        </button>
                        <button onClick={() => remove(p.id)} className="ml-3 text-xs font-medium text-slate-300 hover:text-red-500">
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Product' : 'Add Product'}>
        <form onSubmit={submit} className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Selling price (₦)"
              type="number"
              value={form.selling_price}
              onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
              inputMode="numeric"
              required
            />
            <Input
              label="Cost price (₦)"
              type="number"
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
              inputMode="numeric"
            />
          </div>
          <Input
            label="Stock quantity (optional)"
            type="number"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
            inputMode="numeric"
          />
          {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
