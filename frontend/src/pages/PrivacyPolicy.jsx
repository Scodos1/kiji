import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#d1fae5]">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 font-display text-sm font-bold text-white">K</div>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900">Kiji</span>
        </Link>
        <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-slate-900">Back to home</Link>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: September 16, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate-700">
          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">1. Information We Collect</h2>
            <p className="mt-2">When you use Kiji, we collect:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Account information: your name and email address</li>
              <li>Business data: sales records, expenses, customer information, and product details you enter</li>
              <li>Usage data: how you interact with the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">2. How We Use Your Information</h2>
            <p className="mt-2">We use your information to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Provide and maintain the Kiji platform</li>
              <li>Generate business analytics and AI-powered insights from your data</li>
              <li>Process payments for subscription plans</li>
              <li>Send you service-related communications</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">3. Data Storage and Security</h2>
            <p className="mt-2">Your data is stored on secure servers. We use industry-standard encryption and security practices to protect your information. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">4. Data Sharing</h2>
            <p className="mt-2">We do not share your personal or business data with third parties, except:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>When required by law</li>
              <li>With payment processors (Paystack) to handle subscription payments</li>
              <li>With your explicit consent</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">5. Your Rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Export your data in CSV format</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">6. Data Retention</h2>
            <p className="mt-2">We retain your data for as long as your account is active. If you delete your account, we will remove your data within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">7. Cookies</h2>
            <p className="mt-2">Kiji uses only essential cookies required for authentication and platform functionality. We do not use tracking cookies.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">8. Changes to This Policy</h2>
            <p className="mt-2">We may update this policy from time to time. We will notify you of significant changes via email or through the platform.</p>
          </section>

          <section>
            <h2 className="font-display text-lg font-bold text-slate-900">9. Contact Us</h2>
            <p className="mt-2">If you have questions about this Privacy Policy, contact us at support@kiji.app</p>
          </section>
        </div>
      </main>
    </div>
  )
}
