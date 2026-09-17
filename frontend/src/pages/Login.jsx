import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-[#f0fdf4]">
      <div className="hidden w-1/2 bg-[#f0fdf4]/60 lg:block">
        <div className="flex h-full flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-display text-base font-bold text-white shadow-lg shadow-brand-600/20">
              K
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">Kiji</span>
          </div>
          <h2 className="font-display text-2xl font-bold leading-snug tracking-tight text-slate-900">
            Track your sales. <br />
            Know your profit. <br />
            Grow your business.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
            The smartest way for Nigerian SMEs to manage money, understand customers, and make better decisions.
          </p>
          <div className="mt-10 flex flex-col gap-2.5">
            {['Works on any phone or laptop', 'AI answers your business questions', 'Free to get started'].map((item) => (
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
            Welcome back
          </h1>
          <p className="mt-2 text-center text-sm text-slate-500">
            Log in to your business dashboard
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
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
              placeholder="Enter your password"
              required
            />
            {error && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{error}</div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </form>

          <div className="mt-5 text-center">
            <button className="text-sm font-medium text-slate-400 transition-colors hover:text-brand-600">
              Forgot password?
            </button>
          </div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-300">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 transition-colors hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
