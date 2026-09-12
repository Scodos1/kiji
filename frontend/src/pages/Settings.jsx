import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Input, Select, Alert, Spinner } from '../components/ui'

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

export default function Settings() {
  const { user, refresh } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const [pw, setPw] = useState({ old_password: '', new_password: '', confirm: '' })
  const [pwSaving, setPwSaving] = useState(false)
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')

  useEffect(() => {
    if (user?.businesses?.length) {
      setBusiness(user.businesses[0])
      setLoading(false)
    }
  }, [user])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    setSaved(false)
    try {
      await api.patch(`/business/${business.id}/`, {
        name: business.name,
        category: business.category,
        location: business.location,
        currency: business.currency,
      })
      await refresh()
      setSaved(true)
    } catch {
      setError('Could not save settings.')
    } finally {
      setSaving(false)
    }
  }

  const changePassword = async (e) => {
    e.preventDefault()
    setPwError('')
    setPwSaved(false)
    if (pw.new_password !== pw.confirm) {
      setPwError('New passwords do not match.')
      return
    }
    setPwSaving(true)
    try {
      await api.post('/auth/password/', {
        old_password: pw.old_password,
        new_password: pw.new_password,
      })
      setPwSaved(true)
      setPw({ old_password: '', new_password: '', confirm: '' })
    } catch (err) {
      const data = err.response?.data
      setPwError(
        (Array.isArray(data?.old_password) && data.old_password[0]) ||
          (Array.isArray(data?.new_password) && data.new_password[0]) ||
          data?.detail ||
          'Could not change password.',
      )
    } finally {
      setPwSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Manage your business profile</p>
      </div>

      {business && (
        <>
          <form onSubmit={submit} className="space-y-4">
            <Card className="space-y-4 p-6">
              <h3 className="font-display text-sm font-bold text-slate-900">Business profile</h3>
              <Input
                label="Business name"
                value={business.name}
                onChange={(e) => setBusiness({ ...business, name: e.target.value })}
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
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 font-display text-sm font-bold text-slate-900">Account</h3>
              <p className="text-sm text-slate-600">
                Signed in as <span className="font-semibold text-slate-900">{user?.email}</span>
              </p>
              <p className="mt-2 text-xs text-slate-400">You’re on the Free plan — ₦0/month.</p>
              <a href="/app/billing" className="mt-2 inline-flex text-xs font-semibold text-brand-600 hover:underline">
                View plans & upgrade →
              </a>
            </Card>

            {saved && <Alert type="success">Settings saved successfully.</Alert>}
            {error && <Alert type="danger">{error}</Alert>}
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </form>

          <form onSubmit={changePassword} className="space-y-4">
            <Card className="space-y-4 p-6">
              <h3 className="font-display text-sm font-bold text-slate-900">Change password</h3>
              <Input
                label="Current password"
                type="password"
                value={pw.old_password}
                onChange={(e) => setPw({ ...pw, old_password: e.target.value })}
                required
              />
              <Input
                label="New password"
                type="password"
                value={pw.new_password}
                onChange={(e) => setPw({ ...pw, new_password: e.target.value })}
                placeholder="At least 8 characters"
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                value={pw.confirm}
                onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                required
              />
              {pwSaved && <Alert type="success">Password updated successfully.</Alert>}
              {pwError && <Alert type="danger">{pwError}</Alert>}
              <Button type="submit" variant="secondary" disabled={pwSaving}>
                {pwSaving ? 'Updating…' : 'Update Password'}
              </Button>
            </Card>
          </form>
        </>
      )}
    </div>
  )
}
