import { Link } from 'react-router-dom'

const FEATURES = [
  {
    icon: 'T',
    title: 'Sales & expense tracking',
    desc: 'Record sales and expenses in seconds with no accounting knowledge needed.',
  },
  {
    icon: 'A',
    title: 'Profit & analytics',
    desc: 'See your real profit, margins, and trends without building a single formula.',
  },
  {
    icon: 'C',
    title: 'Customer management',
    desc: 'Know your customers, their spending, and who is slipping away.',
  },
  {
    icon: 'AI',
    title: 'AI business advisor',
    desc: 'Ask "why did my profit drop?" and get a plain-language answer from your own data.',
  },
  {
    icon: 'M',
    title: 'Marketing made easy',
    desc: 'Turn inactive customers into repeat customers with ready-to-send WhatsApp messages.',
  },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 font-display text-sm font-bold text-white">
            K
          </div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">Kiji</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Get Started Free
          </Link>
        </nav>
      </header>

      <main>
        <section className="px-4 pt-16 pb-14 text-center sm:pt-24">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
            Built for Nigerian small businesses
          </div>
          <h1 className="mx-auto max-w-2xl font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Know your business.
            <br />
            Grow your profit.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-500 sm:text-lg">
            Manage your sales, expenses, customers and business growth from one simple
            platform, with AI helping you make smarter decisions.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="w-full rounded-lg bg-brand-700 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-800 sm:w-auto"
            >
              Get Started Free
            </Link>
            <a
              href="#how-it-works"
              className="w-full rounded-lg border border-slate-200 bg-white px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto"
            >
              See How It Works
            </a>
          </div>
        </section>

        <section id="how-it-works" className="border-t border-slate-100 bg-slate-50 px-4 py-16">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Everything your business needs to grow
          </h2>
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-slate-100 bg-white p-6 text-left shadow-sm">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-xs font-bold text-brand-700">
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
            We do not just show you charts. We tell you what they mean and what to do next.
          </p>
          <div className="mx-auto mt-8 flex max-w-md flex-col gap-3 text-left">
            {[
              'Record a sale in under 10 seconds',
              'Get plain-language answers from your business data',
              'Re-engage customers with ready-to-send messages',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-4">
                <span className="flex h-6 w-6 items-center justify-center rounded bg-emerald-50 text-xs font-bold text-emerald-600">
                  /
                </span>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
          <Link
            to="/register"
            className="mt-10 inline-block rounded-lg bg-brand-700 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-800"
          >
            Start tracking free
          </Link>
        </section>
      </main>

      <footer className="border-t border-slate-100 px-4 py-8 text-center text-xs text-slate-400">
        Kiji. Know your business. Understand your customers. Grow your profit.
        <div className="mt-2 flex items-center justify-center gap-4">
          <Link to="/privacy" className="hover:text-slate-600">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-600">Terms and Conditions</Link>
        </div>
      </footer>
    </div>
  )
}
