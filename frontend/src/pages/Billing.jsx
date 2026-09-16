import { useEffect, useState } from 'react'
import api from '../api/client'
import { Alert, Badge, Button, Card, Spinner } from '../components/ui'

export default function Billing() {
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [action, setAction] = useState('')
  const [success, setSuccess] = useState('')

  const load = async () => {
    setError('')
    try {
      const { data } = await api.get('/billing/usage/')
      setUsage(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not load billing.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const upgrade = async (plan) => {
    setAction(plan)
    setError('')
    setSuccess('')
    try {
      const { data: init } = await api.post('/billing/initialize/', { plan })
      if (init.mock) {
        const { data: ver } = await api.post('/billing/verify/', { reference: init.reference })
        setSuccess(`Upgraded to ${ver.plan}! ${init.mock ? '(mock, no charge)' : ''}`)
        await load()
      } else if (init.authorization_url) {
        window.location.href = init.authorization_url
      } else {
        setSuccess('Initialized. Complete payment on Paystack, then verify.')
      }
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.detail || 'Upgrade failed.')
    } finally {
      setAction('')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!usage) {
    return <Alert type="danger">{error || 'No billing data.'}</Alert>
  }

  const pct = usage.limit ? Math.round((usage.used / usage.limit) * 100) : 0

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">Billing & Plans</h1>
        <p className="text-sm text-slate-500">Manage your AI credits and upgrade when you need more.</p>
      </div>

      {error && <Alert type="danger">{error}</Alert>}
      {success && <Alert type="success">{success}</Alert>}

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900">Current plan</h3>
            <p className="mt-1 flex items-center gap-2">
              <span className="font-display text-lg font-bold text-slate-900">{usage.plan_label}</span>
              <Badge color={usage.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}>
                {usage.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </p>
            <p className="mt-1 text-sm text-slate-500">
              N{usage.price_ngn.toLocaleString()}/month. {usage.limit} AI questions.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-700">
              {usage.used} / {usage.limit} used
            </p>
            <p className="text-xs text-slate-400">{usage.remaining} remaining this month</p>
            <div className="mt-2 h-2 w-32 overflow-hidden rounded bg-slate-100">
              <div className="h-full bg-brand-700" style={{ width: `${Math.min(pct, 100)}%` }} />
            </div>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold text-slate-900">Plans</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {usage.plans.map((p) => {
            const isCurrent = p.plan === usage.plan
            const isStarter = p.plan === 'starter'
            return (
              <Card key={p.plan} className={`p-5 ${isCurrent ? 'ring-2 ring-brand-700' : ''} ${isStarter ? 'border-brand-200' : ''}`}>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-sm font-bold capitalize text-slate-900">{p.plan}</h3>
                  {isCurrent && <Badge color="bg-brand-50 text-brand-700">Current</Badge>}
                </div>
                <p className="mt-2 font-display text-2xl font-bold text-slate-900">
                  N{p.price_ngn.toLocaleString()}
                  <span className="text-sm font-normal text-slate-400">/mo</span>
                </p>
                <p className="mt-1 text-sm text-slate-500">{p.limit} AI questions / month</p>
                <ul className="mt-3 space-y-1 text-xs text-slate-600">
                  <li>- Rule-based insights always free</li>
                  <li>- {p.limit >= 50 ? 'Priority support' : 'Community support'}</li>
                  {p.limit >= 200 && <li>- Export + team sharing</li>}
                </ul>
                <Button
                  className="mt-4 w-full"
                  variant={isCurrent ? 'secondary' : 'primary'}
                  disabled={isCurrent || !!action}
                  onClick={() => upgrade(p.plan)}
                >
                  {isCurrent ? 'Current plan' : action === p.plan ? 'Processing...' : p.price_ngn === 0 ? 'Downgrade' : `Upgrade to ${p.plan}`}
                </Button>
              </Card>
            )
          })}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Mock mode: no Paystack key, upgrades are instant mock (no charge). Set PAYSTACK_SECRET_KEY in backend/.env for real payments.
        </p>
      </div>

      <Card className="p-5">
        <h3 className="font-display text-sm font-bold text-slate-900">Need data export?</h3>
        <p className="mt-1 text-sm text-slate-500">Download daily revenue/expenses/profit as CSV for your accountant.</p>
        <a
          href="/api/analytics/export/?type=csv&period=30d"
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50"
        >
          Download CSV (30d)
        </a>
      </Card>
    </div>
  )
}
