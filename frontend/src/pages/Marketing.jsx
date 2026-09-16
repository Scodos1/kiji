import { useEffect, useState } from 'react'
import api from '../api/client'
import { Button, Card, Select, Spinner, Alert } from '../components/ui'
import { naira } from '../utils/format'

const CAMPAIGN_TYPES = [
  { value: 'reengagement', label: 'Customer re-engagement' },
  { value: 'new_product', label: 'New product' },
  { value: 'discount', label: 'Discount' },
  { value: 'referral', label: 'Referral' },
  { value: 'general', label: 'General promotion' },
]

const TONES = [
  { value: 'friendly', label: 'Friendly' },
  { value: 'professional', label: 'Professional' },
  { value: 'exciting', label: 'Exciting' },
  { value: 'polite', label: 'Polite' },
]

export default function Marketing() {
  const [opportunities, setOpportunities] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [campaign, setCampaign] = useState(null)
  const [copied, setCopied] = useState(false)

  const [form, setForm] = useState({
    campaign_type: 'reengagement',
    tone: 'friendly',
    product_name: '',
  })

  const loadData = async () => {
    const [o, p] = await Promise.all([
      api.get('/marketing/opportunities/'),
      api.get('/products/'),
    ])
    setOpportunities(o.data)
    setProducts(p.data.results || p.data)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const generate = async (e) => {
    e.preventDefault()
    setGenerating(true)
    setCopied(false)
    try {
      const { data } = await api.post('/marketing/campaigns/', {
        ...form,
        targets: 'all',
      })
      setCampaign(data)
    } finally {
      setGenerating(false)
    }
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may be unavailable
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Marketing
        </h1>
        <p className="text-sm text-slate-500">
          Find inactive customers and generate ready-to-send marketing messages.
        </p>
      </div>

      {opportunities && opportunities.count > 0 && (
        <Card className="border-brand-100 bg-brand-50/50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-white">
                M
              </span>
              <div>
                <h3 className="font-display text-base font-bold text-brand-900">
                  {opportunities.count} inactive customers
                </h3>
                <p className="text-sm text-slate-500">
                  Haven't purchased in {opportunities.days}+ days. Worth approximately{' '}
                  <span className="font-semibold text-slate-700">
                    {naira(opportunities.total_spent)}
                  </span>{' '}
                  in past sales.
                </p>
              </div>
            </div>
            <a href="#generator" className="rounded-lg bg-brand-700 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-800">
              Create Campaign
            </a>
          </div>
        </Card>
      )}

      {opportunities && opportunities.count === 0 && (
        <Alert type="success">
          No inactive customers right now. Everyone has purchased recently.
        </Alert>
      )}

      <div id="generator" className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 font-display text-base font-bold text-slate-900">Campaign generator</h3>
          <form onSubmit={generate} className="space-y-4">
            <Select
              label="Campaign type"
              value={form.campaign_type}
              options={CAMPAIGN_TYPES}
              onChange={(e) => setForm({ ...form, campaign_type: e.target.value })}
            />
            <Select
              label="Tone"
              value={form.tone}
              options={TONES}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
            />
            {form.campaign_type === 'new_product' && (
              <Select
                label="Product / service"
                value={form.product_name}
                options={[
                  { value: '', label: 'Generic mention' },
                  ...products.map((p) => ({ value: p.name, label: p.name })),
                ]}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
              />
            )}
            <Button type="submit" className="w-full" disabled={generating}>
              {generating ? 'Generating...' : 'Generate Campaign'}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {!campaign && (
            <Card className="flex h-full min-h-[200px] items-center justify-center p-6 text-center">
              <div>
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                  --
                </div>
                <p className="text-sm text-slate-500">
                  Generate a campaign to see your ready-to-send message here.
                </p>
              </div>
            </Card>
          )}

          {campaign && (
            <Card className="border-emerald-100 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-slate-900">
                  Campaign message
                </h3>
                {campaign.llm_enhanced && (
                  <span className="rounded bg-brand-100 px-2.5 py-1 text-[10px] font-bold uppercase text-brand-700">
                    AI enhanced
                  </span>
                )}
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm leading-relaxed text-slate-700">{campaign.template}</p>
                <p className="mt-2 text-xs text-slate-400">{campaign.cta}</p>
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => copy(campaign.template)}>
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => copy(campaign.template.replace('{name}', 'Customer'))}
                >
                  Edit
                </Button>
              </div>
            </Card>
          )}

          {campaign?.messages?.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-3 font-display text-sm font-bold text-slate-900">
                Personalized for your customers
              </h3>
              <div className="max-h-72 space-y-3 overflow-y-auto">
                {campaign.messages.slice(0, 20).map((m) => (
                  <div key={m.customer_id || m.phone} className="rounded-lg border border-slate-100 p-3">
                    <div className="mb-1.5 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                      {m.wa_link && (
                        <a
                          href={m.wa_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-emerald-600 hover:underline"
                        >
                          Send via WhatsApp
                        </a>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed text-slate-600">{m.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
