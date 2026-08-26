import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: '💰',
    title: 'Sales & expense tracking',
    desc: 'Record sales and expenses in seconds — no accounting knowledge needed.',
  },
  {
    icon: '📊',
    title: 'Profit & analytics',
    desc: 'See your real profit, margins, and trends without building a single formula.',
  },
  {
    icon: '👥',
    title: 'Customer management',
    desc: 'Know your customers, their spending, and who’s slipping away.',
  },
  {
    icon: '🤖',
    title: 'AI business advisor',
    desc: 'Ask “why did my profit drop?” and get a plain-language answer from your own data.',
  },
  {
    icon: '📣',
    title: 'Marketing made easy',
    desc: 'Turn inactive customers into repeat customers with ready-to-send WhatsApp messages.',
  },
]

function MockDashboard() {
  return (
    <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Revenue', value: '₦1,240,000', up: '+18.4%' },
          { label: 'Expenses', value: '₦540,000', up: '−4.2%', down: true },
          { label: 'Profit', value: '₦700,000', up: '+24.6%' },
          { label: 'Margin', value: '56.4%', up: '+3.1%' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">{s.label}</p>
            <p className="mt-1 font-display text-lg font-bold text-slate-900">{s.value}</p>
            <p className={`text-xs font-semibold ${s.down ? 'text-red-500' : 'text-emerald-600'}`}>
              {s.up}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="flex items-end gap-1.5" style={{ height: '110px' }}>
          {[35, 55, 40, 70, 60, 85, 75, 95, 80, 100, 90, 70, 65, 90, 60].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-md bg-gradient-to-t from-brand-500 to-brand-400"
              style={{ height: `${h}%`, opacity: 0.6 + (i % 5) * 0.1 }}
            />
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 p-4 text-left">
        <p className="text-xs font-semibold text-brand-700">🤖 AI Business Advisor</p>
        <p className="mt-1 text-sm text-brand-900">
          Your profit is up 24.6% this month. Transportation costs rose 31% — consider
          reviewing your delivery providers.
        </p>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 font-display text-lg font-bold text-white">
            ₦
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">Kiji</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      <main>
        <section className="px-4 pt-16 pb-14 text-center sm:pt-24">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            🇳🇬 Built for Nigerian small businesses
          </div>
          <h1 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Know your business.
            <br />
            <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
              Grow your profit.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
            Manage your sales, expenses, customers and business growth from one simple
            platform — with AI helping you make smarter decisions.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 sm:w-auto"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              See How It Works
            </a>
          </div>
        </section>

        <section className="px-4 pb-16">
          <MockDashboard />
        </section>

        <section id="how-it-works" className="border-t border-slate-100 bg-slate-50 px-4 py-16">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything your business needs to grow
          </h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl border border-slate-100 bg-white p-6 text-left shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-xl">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            No accounting knowledge needed
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
            We don’t just show you charts. We tell you what they mean and what to do next.
          </p>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left">
            {[
              'Record a sale in under 10 seconds',
              'Get plain-language answers from your business data',
              'Re-engage customers with ready-to-send messages',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-sm text-emerald-600">
                  ✓
                </span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <Link
            to="/register"
            className="mt-10 inline-block rounded-xl bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700"
          >
            Start tracking free
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-100 px-4 py-8 text-center text-xs text-slate-400">
        Kiji — Know your business. Understand your customers. Grow your profit.
      </footer>
    </div>
  )
}
