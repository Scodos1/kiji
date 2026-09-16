# Kiji — SME Business Intelligence & Customer Acquisition

> **Know your business. Grow your profit.**
> Built for Nigerian SMEs — track sales/expenses, see profit/margin trends, manage customers/products, and get plain-language AI insights from your own data. Timezone `Africa/Lagos`, currency `NGN` (`backend/config/settings.py:113`).

## Stack

- **Backend** `backend/config/settings.py:28`: Django 6.1 + DRF 3.18 + SimpleJWT 5.5, `django-cors-headers`, `dj-database-url` (SQLite dev / Postgres prod), `openai==3.0.0`, `gunicorn`. Email-based `accounts.User` (`AUTH_USER_MODEL`), JWT 24h/30d (`SIMPLE_JWT`).
- **Frontend** `frontend/package.json:12`: React 19 + Vite 8 + react-router-dom 7 + axios + recharts + Tailwind 4.
- **Infra**: `DJANGO_ENV=production` hardening (`SECURE_SSL_REDIRECT`/`HSTS`/`CSRF_TRUSTED_ORIGINS` `backend/config/settings.py:176`), throttling (`RATE_LIMIT_*` `backend/.env.example:16`), optional Sentry (`SENTRY_DSN`), structured `kiji` logging.

## Features (MVP — `2124af2`)

| Module | Endpoint / Page | Description |
|---|---|---|
| **Auth** `accounts/` | `POST /api/auth/register`, `/login`, `/refresh`, `/password/` | JWT, per-IP throttling (`auth: 20/min`), password change |
| **Business** `businesses/models.py:27` | `POST /api/business/` | Multi-tenant, owner-isolation |
| **Products** `products/` | `/api/products/` + `frontend/src/pages/Products.jsx` | `selling_price`/`cost_price` validation, unique per business |
| **Sales** `sales/` | `/api/sales/` + `Sales.jsx` | `total_amount = quantity * unit_price`, cross-tenant guard |
| **Expenses** `expenses/` | `/api/expenses/` + `Expenses.jsx` | Categorized (`rent`, `transportation`, etc.) |
| **Customers** `customers/` | `/api/customers/?status=active|at_risk|inactive` | Phone uniqueness per business, status from `last_sale()` (paginated) |
| **Analytics** `analytics/service.py:44` | `/api/analytics/overview`, `/revenue`, `/expenses`, `/products`, `/customers` → `Dashboard.jsx` | Periods `7d/30d/90d/1y`, daily buckets `TruncDate` TZ-aware, trends `%` |
| **AI Advisor** `ai_advisor/service.py:202` | `POST /api/ai/ask`, `GET /api/ai/insights` → `AIAdvisor.jsx` | LLM (`LLM_API_KEY`/`LLM_BASE_URL` `backend/.env.example:26`) or rule-based fallback; cap `AI_FREE_MONTHLY_QUERIES=5`; never invents numbers |
| **Marketing** `marketing/service.py:87` | `/api/marketing/opportunities`, `/campaigns` → `Marketing.jsx` | Inactive-customer detection (60d), template + optional LLM, `wa.me` links with `234` normalization |
| **Demo** `accounts/management/commands/seed_demo_data.py:60` | `python manage.py seed_demo_data` | Demo user with pre-filled business data (set `DEMO_PASSWORD` env var)

## Project layout

```
backend/          Django apps: accounts, businesses, products, sales, expenses, customers, analytics, ai_advisor, marketing
  config/settings.py  env-driven, production hardening
  manage.py
frontend/         Vite React SPA: Landing, Login/Register, Onboarding, Dashboard, Sales, Expenses, Customers, Products, AIAdvisor, Marketing, Settings
  src/api/client.js   axios + JWT interceptor
  vite.config.js      /api → http://localhost:8000 proxy
```

## Quick start

### 1. Backend

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # or use repo .venv at ../.venv
pip install -r requirements.txt
cp .env.example .env   # edit SECRET_KEY, LLM_API_KEY optional, DATABASE_URL optional
python manage.py migrate
python manage.py seed_demo_data   # optional: demo data (set DEMO_PASSWORD env var)
python manage.py runserver 8000  # http://localhost:8000/health/ → {"status":"ok"}
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173 (proxy /api → 8000)
npm run build   # → dist/
npm run lint    # oxlint
```

### 3. Env

Copy `backend/.env.example` → `backend/.env`. Key vars:

```
SECRET_KEY, DEBUG, ALLOWED_HOSTS, DJANGO_ENV=development|production
DATABASE_URL=postgres://... (else SQLite db.sqlite3)
CORS_ALLOWED_ORIGINS=http://localhost:5173, CSRF_TRUSTED_ORIGINS=https://...
LLM_API_KEY, LLM_MODEL=gpt-4o-mini, LLM_BASE_URL (OpenAI/OpenRouter/Groq), AI_FREE_MONTHLY_QUERIES=5
SENTRY_DSN (optional)
```

## API & auth

- JWT: `Authorization: Bearer <access>`; refresh via `POST /api/auth/refresh/`.
- Pagination: `?page=1` (PAGE_SIZE 50) — `REST_FRAMEWORK:137`.
- Errors: consistent JSON `{"detail": ...}` via `config.exceptions:139`.
- Rates: `anon 120/hour`, `user 2000/hour`, `auth 20/minute` (overridable via env).

## Tests

All 24 tests live in `backend/accounts/tests.py:42` (audit + throttling + AI budget + e2e smoke):

```bash
# via repo venv
../.venv/Scripts/python backend/manage.py test accounts --verbosity=2
# or
.venv\Scripts\python manage.py test accounts --verbosity=2
```

Other `*/tests.py` are placeholders — expand per app next.

## Operations

- **Backup**: `python manage.py dbbackup` (`accounts/management/commands/dbbackup.py`) → `backend/backups/`
- **Logs**: `kiji` + `django` to console `verbose` (`config/settings.py:195`)
- **Prod**: set `DJANGO_ENV=production` (forces `DEBUG=False`, `SECURE_SSL_REDIRECT`, HSTS, secure cookies). Run `gunicorn config.wsgi` behind TLS.

## Hygiene

- Archives `*.zip` / `*.tar.gz` ignored (`/.gitignore:23`) — stray `telegram_signal_copier_fixed.zip` removed 2026-09-12 (kept at `Desktop/`).

## Roadmap (Immediate → Next)

- [x] Hygiene: `.gitignore` zip, README, lint/build verify
- [ ] Perf: denormalize `analytics/service.py:94` inactive count (avoid loop `c.status()`), prefetch `customer_segments`
- [ ] Coverage: split `accounts/tests.py` → per-app, add frontend vitest
- [ ] Deploy: Dockerfile/Procfile, `DATABASE_URL`, CI (GitHub Actions), `SENTRY_DSN`
