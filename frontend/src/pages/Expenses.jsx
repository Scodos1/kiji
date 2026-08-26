import { useEffect, useState } from 'react'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import api from '../api/client'
import { Button, Card, Input, Select, Modal, Spinner, EmptyState } from '../components/ui'
import { naira, formatDate } from '../utils/format'
import { firstError } from '../utils/errors'

const CATEGORIES = [
  { value: 'inventory', label: 'Inventory' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'rent', label: 'Rent' },
  { value: 'salary', label: 'Salary' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
]

const COLORS = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#94a3b8']

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [monthTotal, setMonthTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)

  const [form, setForm] = useState({
    category: 'inventory',
    amount: '',
    description: '',
  })

  const loadData = async () => {
    const [e, b, o] = await Promise.all([
      api.get('/expenses/'),
      api.get('/analytics/expenses/'),
      api.get('/analytics/overview/'),
    ])
    setExpenses(e.data.results || e.data)
    setBreakdown(b.data)
    setMonthTotal(o.data.expenses)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ category: 'inventory', amount: '', description: '' })
    setError('')
    setModalOpen(true)
  }

  const openEdit = (e) => {
    setEditing(e)
    setForm({
      category: e.category,
      amount: e.amount,
      description: e.description || '',
    })
    setError('')
    setModalOpen(true)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (editing) {
        await api.patch(`/expenses/${editing.id}/`, form)
      } else {
        await api.post('/expenses/', {
          ...form,
          expense_date: new Date().toISOString(),
        })
      }
      setModalOpen(false)
      setEditing(null)
      setForm({ category: 'inventory', amount: '', description: '' })
      await loadData()
    } catch (err) {
      setError(firstError(err.response?.data, 'Could not record expense.'))
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this expense?')) return
    await api.delete(`/expenses/${id}/`)
    await loadData()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Expenses</h1>
          <p className="text-sm text-slate-500">Track where your money goes</p>
        </div>
        <Button onClick={openAdd} className="!px-5">
          + Record Expense
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-1">
          <p className="text-sm font-medium text-slate-500">This Month</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-slate-900">{naira(monthTotal)}</p>

          {breakdown.length > 0 && (
            <>
              <div className="mt-5 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakdown}
                      dataKey="amount"
                      nameKey="label"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                    >
                      {breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => naira(v)} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1.5">
                {breakdown.map((b, i) => (
                  <div key={b.category} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      {b.label}
                    </span>
                    <span className="font-semibold text-slate-900">{naira(b.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No expenses yet"
                message="Record expenses like rent, transportation and stock to see where your money goes."
                action={<Button onClick={openAdd}>+ Record Expense</Button>}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3 font-semibold">Date</th>
                    <th className="px-5 py-3 font-semibold">Category</th>
                    <th className="px-5 py-3 font-semibold">Description</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-3 text-slate-500">{formatDate(e.expense_date)}</td>
                      <td className="px-5 py-3">
                        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium capitalize text-brand-700">
                          {e.category_display}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{e.description || '—'}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{naira(e.amount)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => openEdit(e)}
                            className="text-xs font-medium text-slate-300 hover:text-brand-600"
                          >
                            Edit
                          </button>
                          <button onClick={() => remove(e.id)} className="text-xs font-medium text-slate-300 hover:text-red-500">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Expense' : 'Record New Expense'}>
        <form onSubmit={submit} className="space-y-4">
          <Select
            label="Category"
            value={form.category}
            options={CATEGORIES}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
          <Input
            label="Amount (₦)"
            type="number"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            inputMode="numeric"
            placeholder="0"
            required
          />
          <Input
            label="Description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="e.g. Delivery to Yaba"
          />
          {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
