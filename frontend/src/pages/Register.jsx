import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'
import { firstError } from '../utils/errors'

export default function Register() {
  const { register, login } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(name, email, password)
      await login(email, password)
      navigate('/onboarding')
    } catch (err) {
      setError(firstError(err.response?.data, 'Something went wrong. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#d1fae5]">
      <div className="hidden w-1/2 bg-[#d1fae5]/60 lg:block">
        <div className="flex h-full flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-display text-base font-bold text-white shadow-lg shadow-brand-600/20">
              K
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">Kiji</span>
          </div>
          <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-slate-900">
            Start running your business <br />
            like a pro today.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            No accounting knowledge needed. Record your first sale in under 10 seconds.
          </p>
          <div className="mt-10 flex flex-col gap-2.5">
            {['No credit card required', 'Free plan includes core features', 'Cancel anytime'].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                  <svg className="h-3 w-3 text-emerald-600" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l3.5 3.5L13 5" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-display text-base font-bold text-white shadow-lg shadow-brand-600/20">
              K
            </div>
            <span className="font-display text-lg font-bold text-slate-900">Kiji</span>
          </div>

          <h1 className="text-center font-display text-2xl font-bold tracking-tight text-slate-900">
            Create your account
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Free to use. Start in 2 minutes.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <Input
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aisha Okafor"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 10 characters"
              required
            />
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
