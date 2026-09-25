# Kiji — SME Business Intelligence & Customer Acquisition

> **Know your business. Grow your profit.**
> Built for Nigerian SMEs — track sales/expenses, see profit/margin trends, manage customers/products, and get plain-language AI insights from your own data. Timezone `Africa/Lagos`, currency `NGN` (`backend/config/settings.py:113`).

## Stack

- **Backend**: Django 6.1 + DRF 3.18 + SimpleJWT 5.5, `django-cors-headers`, `dj-database-url` (SQLite dev / Postgres prod), `openai==3.0.0`, `gunicorn`, WhiteNoise static files. Email-based `accounts.User` (`AUTH_USER_MODEL`), JWT 24h/30d.
- **Frontend**: React 19 + Vite 8 + react-router-dom 7 + axios + recharts + Tailwind 4.
- **Infra**: Multi-stage Docker build (frontend built in `node` stage, copied into Python image). Railway deployment with `DATABASE_URL` (Postgres), `SECRET_KEY`, `DJANGO_ENV=production`. WhiteNoise serves static assets; Django `serve_frontend` view serves the SPA with fallback to `index.html`.

## Deployment (Railway)

- **Live**: https://web-production-92d0a.up.railway.app
- **Dockerfile**: Multi-stage — `node:20-alpine` builds frontend, `python:3.12-slim` runs gunicorn.
- **PORT**: Railway assigns `$PORT` (default 8080); gunicorn binds via shell-form CMD `sh -c "exec gunicorn ... --bind 0.0.0.0:${PORT:-8000}"`.
- **Health check**: `GET /health/` → `{"status": "ok"}`
- **SPA routing**: Single catch-all `re_path(r'^(?!api/|admin/)(?P<path>.*)$', serve_frontend)` serves `frontend/dist/` files with proper content types and falls back to `index.html`.
- **Superuser**: Create via Railway dashboard shell: `python manage.py createsuperuser` (admin URL is protected by `ADMIN_SECRET_KEY`).

## Features

| Module | Endpoint / Page | Description |
|---|---|---|
| **Auth** `accounts/` | `POST /api/auth/register`, `/login`, `/refresh`, `/password/` | JWT, per-IP throttling, password change |
| **Business** `businesses/models.py` | `POST /api/business/` | Multi-tenant, owner-isolation |
| **Products** `products/` | `/api/products/` + `Products.jsx` | Price validation, unique per business |
| **Sales** `sales/` | `/api/sales/` + `Sales.jsx` | `total_amount = quantity * unit_price`, cross-tenant guard |
| **Expenses** `expenses/` | `/api/expenses/` + `Expenses.jsx` | Categorized |
| **Customers** `customers/` | `/api/customers/?status=active|at_risk|inactive` | Phone uniqueness per business, status from `last_sale()` |
| **Analytics** `analytics/service.py` | `/api/analytics/overview`, `/revenue`, `/expenses`, `/products`, `/customers` → `Dashboard.jsx` | Periods `7d/30d/90d/1y`, daily buckets, trends `%` |
| **AI Advisor** `ai_advisor/service.py` | `POST /api/ai/ask`, `GET /api/ai/insights` → `AIAdvisor.jsx` | LLM or rule-based fallback; monthly query cap; never invents numbers |
| **Marketing** `marketing/service.py` | `/api/marketing/opportunities`, `/campaigns` → `Marketing.jsx` | Inactive-customer detection, WhatsApp `wa.me` links |
| **Billing** `billing/` | `/api/billing/` + `Billing.jsx` | Paystack integration (mock in dev), CSV exports |
| **Demo** | `python manage.py seed_demo_data` | Demo user with pre-filled business data |

## Design System

- **Palette**: Mint green + army green. Brand tokens `brand-50` (`#ecfdf5`) through `brand-900` (`#064e3b`) in `frontend/src/index.css`.
- **Background**: Soft sage `#d1fae5` for public pages; light mint `#f0fdf4` for app shell.
- **Typography**: `Plus Jakarta Sans` (display/headings), `Inter` (body).
- **Components**: `Button` (primary/secondary/ghost/danger), `Card`, `StatCard`, `Input`, `Select`, `Modal`, `Badge`, `Alert`, `EmptyState`, `Spinner` in `frontend/src/components/ui.jsx`.
- **Icons**: Inline SVG only (no emoji, no icon libraries).

## Project layout

```
backend/          Django apps: accounts, businesses, products, sales, expenses,
                  customers, analytics, ai_advisor, marketing, billing
  config/settings.py   env-driven, production hardening
  config/views.py      serve_frontend (SPA fallback)
  config/middleware.py SecurityHeaders + AdminIPGuard
frontend/         Vite React SPA
  src/components/      ui.jsx, Layout.jsx
  src/pages/           Landing, Login, Register, Onboarding, Dashboard, Sales,
                       Expenses, Customers, Products, AIAdvisor, Marketing,
                       Billing, Settings, PrivacyPolicy, Terms
  src/api/client.js    axios + JWT interceptor
Dockerfile        Multi-stage: node → python
Procfile          gunicorn (Railway)
```

## Quick start

### Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # edit SECRET_KEY, DATABASE_URL optional
python manage.py migrate
python manage.py runserver 8000  # /health/ → {"status":"ok"}
```

### Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173 (proxy /api → 8000)
npm run build   # → dist/
npm run lint    # oxlint
```

## Tests

31 backend tests across all apps (audit, throttling, AI budget, e2e smoke, analytics, cross-tenant isolation):

```bash
cd backend
python manage.py test --verbosity=2   # ~5 minutes
```

## Security

- Security headers middleware (CSP, X-Frame-Options, etc.)
- Admin URL behind `ADMIN_SECRET_KEY`
- CORS locked to allowed origins
- DB SSL enforcement in production
- JWT hardening (rotation, blacklist)
- Django password validators
- Session/CSRF hardening
- Per-IP rate limiting on auth endpoints
- Server error sanitization (no debug info in production)

## Operations

- **Logs**: `kiji` + `django` to console (`config/settings.py`)
- **Prod**: `DJANGO_ENV=production` forces `DEBUG=False`, SSL redirect, HSTS, secure cookies.
- **Static**: WhiteNoise with compressed+hashed storage in production.
