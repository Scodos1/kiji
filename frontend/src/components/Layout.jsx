import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/app', label: 'Dashboard', icon: 'D', end: true },
  { to: '/app/sales', label: 'Sales', icon: 'S' },
  { to: '/app/expenses', label: 'Expenses', icon: 'E' },
  { to: '/app/customers', label: 'Customers', icon: 'C' },
  { to: '/app/products', label: 'Products', icon: 'P' },
  { to: '/app/ai', label: 'AI Advisor', icon: 'A', highlight: true },
  { to: '/app/marketing', label: 'Marketing', icon: 'M' },
  { to: '/app/billing', label: 'Billing', icon: 'B' },
]

const MOBILE_NAV = [
  { to: '/app', label: 'Home', icon: 'D', end: true },
  { to: '/app/sales', label: 'Sales', icon: 'S' },
  { to: '/app/customers', label: 'Customers', icon: 'C' },
  { to: '/app/ai', label: 'AI', icon: 'A' },
  { to: '/app/marketing', label: 'More', icon: '...' },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-800 font-display text-sm font-bold text-white">
        K
      </div>
      <span className="font-display text-base font-bold tracking-tight text-slate-900">
        Kiji
      </span>
    </div>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const firstName = user?.name || user?.email?.split('@')[0] || 'there'

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-brand-50 text-brand-800'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-100 bg-white px-4 py-6 lg:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={linkClass}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-100 text-[10px] font-bold text-brand-700">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.highlight && (
                <span className="rounded bg-brand-700 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  AI
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-100 pt-4">
          <NavLink to="/app/settings" className={linkClass}>
            <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">* </span>
            <span className="flex-1">Settings</span>
          </NavLink>
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">x</span>
            Log out
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:px-8">
          <div>
            <p className="font-display text-sm font-bold text-slate-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {firstName}
            </p>
            <p className="hidden text-xs text-slate-400 sm:block">
              {user?.businesses?.[0]?.name || 'Your business'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
              {firstName[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3 lg:hidden">
          <Brand />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded text-slate-500 hover:bg-slate-50"
          >
            Menu
          </button>
        </div>

        {mobileOpen && (
          <nav className="border-b border-slate-100 bg-white px-4 py-2 lg:hidden">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setMobileOpen(false)}
                className={linkClass}
              >
                <span className="flex h-6 w-6 items-center justify-center rounded bg-brand-100 text-[10px] font-bold text-brand-700">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </NavLink>
            ))}
            <NavLink
              to="/app/settings"
              onClick={() => setMobileOpen(false)}
              className={linkClass}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">* </span>
              <span className="flex-1">Settings</span>
            </NavLink>
            <button
              onClick={() => {
                setMobileOpen(false)
                logout()
                navigate('/login')
              }}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-600">x</span>
              Log out
            </button>
          </nav>
        )}

        <main className="flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 z-30 grid grid-cols-5 border-t border-slate-100 bg-white px-2 py-2 lg:hidden">
          {MOBILE_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded py-1.5 text-[10px] font-medium ${
                  isActive ? 'text-brand-700' : 'text-slate-400'
                }`
              }
            >
              <span className="text-xs font-bold leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
