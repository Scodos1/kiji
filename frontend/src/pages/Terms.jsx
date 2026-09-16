import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 font-display text-sm font-bold text-white">K</div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">Kiji</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Back to home</Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-slate-900">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 16, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p className="mt-2">By accessing or using Kiji, you agree to these Terms and Conditions. If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">2. Description of Service</h2>
            <p className="mt-2">Kiji is a business intelligence platform that helps Nigerian SMEs track sales, expenses, customers, and receive AI-powered business insights.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">3. Account Registration</h2>
            <p className="mt-2">You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">4. Subscriptions and Payments</h2>
            <p className="mt-2">Free tier accounts have limited AI query usage. Paid plans are processed through Paystack. All payments are non-refundable unless required by law.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">5. User Data</h2>
            <p className="mt-2">You retain ownership of all data you enter into Kiji. We will not use your business data for purposes other than providing the service to you.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">6. Acceptable Use</h2>
            <p className="mt-2">You agree not to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Use the platform for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to other accounts or systems</li>
              <li>Interfere with or disrupt the platform</li>
              <li>Use automated tools to access the platform without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">7. AI-Generated Insights</h2>
            <p className="mt-2">AI insights are generated from your data and are provided for informational purposes. They do not constitute financial or business advice. You are responsible for your own business decisions.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">8. Limitation of Liability</h2>
            <p className="mt-2">Kiji is provided "as is" without warranties. We are not liable for any damages arising from your use of the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">9. Termination</h2>
            <p className="mt-2">You may delete your account at any time. We reserve the right to suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">10. Changes to Terms</h2>
            <p className="mt-2">We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">11. Contact</h2>
            <p className="mt-2">Questions about these terms? Contact us at support@kiji.app</p>
          </section>
        </div>
      </main>
    </div>
  )
}
