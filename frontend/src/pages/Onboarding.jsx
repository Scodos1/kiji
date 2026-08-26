import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Select } from '../components/ui'
import { firstError } from '../utils/errors'

const CATEGORIES = [
  { value: 'retail', label: 'Retail & Online Seller' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'beauty', label: 'Beauty / Cosmetics' },
  { value: 'food', label: 'Food & Restaurants' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'services', label: 'Services' },
  { value: 'salon', label: 'Barber / Salon' },
  { value: 'events', label: 'Event Planning' },
  { value: 'photography', label: 'Photography' },
  { value: 'cleaning', label: 'Cleaning Services' },
  { value: 'repair', label: 'Repair Services' },
  { value: 'wholesale', label: 'Wholesale' },
  { value: 'pharmacy', label: 'Pharmacy' },
  { value: 'other', label: 'Other' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { refresh } = useAuth()
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [business, setBusiness] = useState({
    name: '',
    category: 'fashion',
    location: '',
    currency: 'NGN',
  })
  const [product, setProduct] = useState({
    name: '',
    selling_price: '',
    cost_price: '',
  })

  const createBusiness = async () => {
    const { data } = await api.post('/business/', business)
    await refresh()
    return data.id
  }

  const handleBusiness = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await createBusiness()
      setStep(2)
    } catch (err) {
      setError(firstError(err.response?.data, 'Could not create business.'))
    } finally {
      setLoading(false)
    }
  }

  const handleProduct = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/products/', {
        name: product.name,
        selling_price: product.selling_price,
        cost_price: product.cost_price || 0,
      })
      navigate('/app')
    } catch (err) {
      setError(firstError(err.response?.data, 'Could not add product.'))
    } finally {
      setLoading(false)
    }
  }

  const skipProduct = async () => {
    navigate('/app')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-xl font-bold text-white">
            ₦
          </div>
          <h1 className="font-display text-xl font-bold text-slate-900">
            {step === 1 && 'Set up your business'}
            {step === 2 && 'Add your first product'}
            {step === 3 && 'You’re all set 🎉'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {step === 1 && 'Step 1 of 2 — tell us about your business'}
            {step === 2 && 'Step 2 of 2 — you can add more later'}
          </p>
          <div className="mx-auto mt-4 flex max-w-[160px] gap-1.5">
            <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-brand-600' : 'bg-slate-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-brand-600' : 'bg-slate-200'}`} />
          </div>
        </div>

        {step === 1 && (
          <form onSubmit={handleBusiness} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Input
              label="Business name"
              value={business.name}
              onChange={(e) => setBusiness({ ...business, name: e.target.value })}
              placeholder="Aisha Fashion"
              required
            />
            <Select
              label="Business category"
              value={business.category}
              options={CATEGORIES}
              onChange={(e) => setBusiness({ ...business, category: e.target.value })}
            />
            <Input
              label="Location"
              value={business.location}
              onChange={(e) => setBusiness({ ...business, location: e.target.value })}
              placeholder="Lagos"
            />
            <Select
              label="Currency"
              value={business.currency}
              options={[
                { value: 'NGN', label: 'Nigerian Naira (₦)' },
                { value: 'USD', label: 'US Dollar ($)' },
              ]}
              onChange={(e) => setBusiness({ ...business, currency: e.target.value })}
            />
            {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving…' : 'Continue'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleProduct} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <Input
              label="What do you sell?"
              value={product.name}
              onChange={(e) => setProduct({ ...product, name: e.target.value })}
              placeholder="e.g. Sneakers, Haircut, Catering"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Selling price (₦)"
                type="number"
                value={product.selling_price}
                onChange={(e) => setProduct({ ...product, selling_price: e.target.value })}
                placeholder="45000"
                required
              />
              <Input
                label="Cost price (₦)"
                type="number"
                value={product.cost_price}
                onChange={(e) => setProduct({ ...product, cost_price: e.target.value })}
                placeholder="30000"
              />
            </div>
            <p className="text-xs text-slate-400">
              Cost price is what you paid for it — it helps us calculate your real profit.
            </p>
            {error && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Saving…' : 'Save & Go to Dashboard'}
            </Button>
            <button
              type="button"
              onClick={skipProduct}
              className="w-full text-center text-sm font-medium text-slate-400 hover:text-slate-600"
            >
              Skip for now
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
