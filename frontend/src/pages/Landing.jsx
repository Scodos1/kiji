import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
    title: 'Sales & expense tracking',
    desc: 'Record sales and expenses in seconds. No accounting knowledge needed, just tap and go.',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
    title: 'Profit & analytics',
    desc: 'See your real profit, margins, and trends without building a single formula.',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: 'Customer management',
    desc: 'Know your best customers, their spending habits, and who is drifting away.',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 017 7c0 5-7 13-7 13S5 14 5 9a7 7 0 017-7z" /><circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    title: 'AI business advisor',
    desc: 'Ask "why did my profit drop?" and get a plain-language answer from your own data.',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 2L11 13" /><path d="M22 2L15 22l-4-9-9-4z" />
      </svg>
    ),
    title: 'Marketing made easy',
    desc: 'Turn inactive customers into repeat buyers with ready-to-send WhatsApp messages.',
  },
  {
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: 'Works on any device',
    desc: 'Use it on your phone at the market, on your laptop at home, wherever you do business.',
  },
]

const STEPS = [
  { num: '1', title: 'Sign up in 30 seconds', desc: 'Enter your name, email and you are in. No credit card required.' },
  { num: '2', title: 'Record your first sale', desc: 'Tap "New Sale", pick a customer and product, and you are done.' },
  { num: '3', title: 'See your insights', desc: 'Your dashboard updates instantly. AI tells you what to do next.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#d1fae5]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 font-display text-sm font-bold text-white shadow-sm shadow-brand-600/20">
            K
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">Kiji</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-md"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      <main>
        <section className="px-6 pt-20 pb-20 text-center sm:pt-32 sm:pb-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
            Built for Nigerian small businesses
          </div>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Know your business.
            <br />
            <span className="text-brand-600">Grow your profit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
            Manage your sales, expenses, customers and growth from one simple platform.
            AI helps you understand your numbers and make smarter decisions.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/25 sm:w-auto"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-xl border border-slate-200 bg-white px-8 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 sm:w-auto"
            >
              See How It Works
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">Free to use. No credit card required.</p>
        </section>

        <section className="border-t border-slate-100 bg-slate-50/80 px-6 py-20">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything your business needs to grow
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-sm text-slate-500">
            One platform to track your money, understand your customers, and make better decisions.
          </p>
          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="group rounded-xl border border-slate-200/60 bg-white p-6 text-left shadow-sm transition-all hover:border-brand-200 hover:shadow-md">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                  {f.icon}
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="px-6 py-20">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Start in three simple steps
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500">
            No training needed. Most users record their first sale within 2 minutes of signing up.
          </p>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.num} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 font-display text-lg font-bold text-white shadow-lg shadow-brand-600/20">
                  {s.num}
                </div>
                <h3 className="font-display text-base font-bold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50/80 px-6 py-20">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            No accounting knowledge needed
          </h2>
          <p className="mx-auto mt-3 max-w-md text-center text-sm text-slate-500">
            We do not just show you charts. We tell you what they mean and what to do next.
          </p>
          <div className="mx-auto mt-10 flex max-w-lg flex-col gap-3 text-left">
            {[
              'Record a sale in under 10 seconds',
              'Get plain-language answers from your business data',
              'Re-engage customers with ready-to-send messages',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l3.5 3.5L13 5" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              to="/register"
              className="inline-block rounded-xl bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/20 transition-all hover:bg-brand-700 hover:shadow-xl"
            >
              Start tracking free
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 font-display text-xs font-bold text-white">
              K
            </div>
            <span className="text-sm font-semibold text-slate-600">Kiji</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link to="/privacy" className="transition-colors hover:text-slate-600">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-slate-600">Terms and Conditions</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
