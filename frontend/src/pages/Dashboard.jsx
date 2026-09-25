import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/client'
import { Card, Spinner, StatCard, Alert } from '../components/ui'
import { naira, formatDate } from '../utils/format'

const PERIODS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '90d', label: '3 Months' },
  { value: '1y', label: '1 Year' },
]

const TrendText = ({ change }) => {
  if (change == null) return null
  const up = change >= 0
  return (
    <span className={`text-sm font-semibold ${up ? 'text-emerald-600' : 'text-red-600'}`}>
      {up ? '+' : ''}{Math.abs(change)}% vs previous period
    </span>
  )
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [series, setSeries] = useState([])
  const [insights, setInsights] = useState([])
  const [period, setPeriod] = useState('30d')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      api.get('/analytics/overview/', { params: { period } }),
      api.get('/analytics/revenue/', { params: { period } }),
      api.get('/ai/insights/'),
    ])
      .then(([o, s, i]) => {
        if (!active) return
        setOverview(o.data)
        setSeries(s.data)
        setInsights(i.data)
      })
      .catch(() => {})
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [period])

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner />
      </div>
    )
  }

  if (!overview) {
    return <Alert type="warning">Could not load your business data.</Alert>
  }

  const empty = overview.revenue === 0 && overview.expenses === 0
  const t = overview.trends

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Business Overview
          </h1>
          <p className="text-sm text-slate-500">How is your business doing?</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                period === p.value
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {empty ? (
        <Card className="p-10">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Your dashboard is ready
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Record your first sale to see your revenue, profit and insights appear here.
            </p>
            <Link
              to="/app/sales"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-xl"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Record your first sale
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Revenue"
              value={naira(overview.revenue)}
              change={t.revenue_change}
              icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></svg>}
            />
            <StatCard
              label="Expenses"
              value={naira(overview.expenses)}
              change={t.expenses_change}
              icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>}
            />
            <StatCard
              label="Profit"
              value={naira(overview.profit)}
              change={t.profit_change}
              icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" /></svg>}
            />
            <StatCard
              label="Profit Margin"
              value={`${overview.profit_margin}%`}
              change={t.margin_change}
              icon={<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>}
            />
          </div>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-sm font-bold text-slate-900">
                Revenue, expenses & profit
              </h3>
              <TrendText change={t.revenue_change} />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => naira(value)}
                    contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#rev)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} fill="none" name="Expenses" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} fill="none" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-bold text-slate-900">Top products</h3>
                <Link to="/app/products" className="text-xs font-semibold text-brand-600 transition-colors hover:text-brand-700">
                  View all
                </Link>
              </div>
              {overview.best_products.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-400">
                  No product sales yet. Add products and record sales to see performance.
                </p>
              ) : (
                <div className="space-y-3">
                  {overview.best_products.map((p, i) => (
                    <div key={p.product} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-700">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <p className="text-sm font-semibold text-slate-800">{p.product}</p>
                          <p className="text-sm font-bold text-slate-900">{naira(p.revenue)}</p>
                        </div>
                        <p className="text-xs text-slate-400">{p.units_sold} units</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Recent sales
                </h4>
                {overview.recent_sales.length === 0 ? (
                  <p className="text-sm text-slate-400">No sales recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {overview.recent_sales.map((s) => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">
                          {s.customer} / {s.product}
                        </span>
                        <span className="flex items-center gap-3">
                          <span className="hidden text-xs text-slate-400 sm:inline">
                            {formatDate(s.date)}
                          </span>
                          <span className="font-semibold text-slate-900">{naira(s.amount)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            <Card className="border-brand-100 bg-brand-50/50 p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-[10px] font-bold text-white shadow-sm shadow-brand-600/20">
                  AI
                </span>
                <h3 className="font-display text-sm font-bold text-brand-900">AI Business Advisor</h3>
              </div>
              {insights.length === 0 ? (
                <p className="text-sm text-slate-500">No insights yet. Keep recording data.</p>
              ) : (
                <div className="space-y-3">
                  {insights.slice(0, 3).map((ins, i) => (
                    <div key={i} className="rounded-lg border border-brand-100 bg-white p-3 shadow-sm">
                      <p className="text-xs font-bold text-brand-700">{ins.title}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-600">{ins.message}</p>
                    </div>
                  ))}
                </div>
              )}
              <Link
                to="/app/ai"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                Ask AI
              </Link>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
