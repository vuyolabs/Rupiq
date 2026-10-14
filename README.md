# 💰 Rupiq — AI-Powered Personal Finance Manager

Rupiq is a full-stack personal finance app for tracking accounts, transactions, budgets and savings goals, with a built-in AI advisor that answers questions about your money using your real data. Amounts are shown in INR (₹) with Indian digit grouping.

Built with **Next.js 16**, **React 19**, **Prisma 7 + PostgreSQL**, **Supabase Auth**, the **Vercel AI SDK** on **Groq**, and **shadcn/ui**.

---

## ✨ Features

- **Dashboard** — income, expenses and net savings at a glance, weekly / monthly / yearly cashflow, category breakdown charts, and snapshots of accounts, budgets and goals.
- **Accounts** — bank, cash, credit card and wallet accounts with balances and a net-worth summary.
- **Transactions** — server-side pagination, debounced search, category filters, sorting and bulk delete. Each transaction updates its account balance.
- **Budgets** — monthly budgets per category, with utilization bars and over-budget alerts.
- **Goals** — savings goals with target amounts, target dates and progress tracking.
- **Reports** — month-by-month financial reports, exportable as a branded **PDF** (jsPDF) or **Excel** (`.xlsx`) file.
- **Rupiq AI advisor** — a chat drawer that streams answers from a Groq-hosted model. The model calls typed, user-scoped tools to fetch real numbers instead of guessing:
  | Tool | What it answers |
  | :--- | :--- |
  | `getCashflowSummary` | Income, expenses, net savings and savings rate for a month or year |
  | `getCategoryBreakdown` | Where the money went, by category, with each category's share |
  | `getTopMerchants` | Top merchants by spend |
  | `getBudgetStatus` | Budget utilization and overspends |
  | `searchTransactions` | Finding specific transactions |
  | `getAccountsAndGoals` | Account balances and goal progress |

  Chat history is saved per user in PostgreSQL and loaded on the server, so the client can't tamper with it. History can be cleared from the drawer.
- **Authentication** — email/password sign-up and login, plus password reset, all through Supabase Auth with SSR cookie sessions.
- **PWA** — installable, with a web manifest, service worker and install prompt.
- **Theming** — light, dark and system themes via `next-themes`.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript 5 |
| Styling & UI | Tailwind CSS v4, shadcn/ui (Base UI), Lucide & Phosphor icons, Framer Motion |
| Charts & tables | Recharts, TanStack Table |
| Database | PostgreSQL, Prisma ORM 7 with `@prisma/adapter-pg` (`pg` pool) |
| Auth | Supabase Auth (`@supabase/ssr`) |
| AI | Vercel AI SDK (`ai`, `@ai-sdk/react`), `@ai-sdk/groq`, Streamdown for Markdown rendering |
| Validation | Zod 4 |
| Exports | jsPDF, jsPDF-AutoTable, SheetJS (`xlsx`) |

---

## 📁 Project Structure

```
prisma/
  schema.prisma        # User, Account, Transaction, Budget, FinancialGoal, AiMessage
  migrations/          # SQL migrations
  seed.ts              # Sample data generator
public/sw.js           # Service worker
src/
  actions/             # Server Actions (accounts, transactions, budgets, goals, reports, auth, settings, AI history)
  app/
    (auth)/            # login, signup, forgot-password, reset-password
    (root)/            # dashboard, accounts, transactions, budgets, goals, reports, settings
    api/chat/route.ts  # Streaming AI advisor endpoint
    auth/callback/     # Supabase PKCE callback (email confirm, recovery)
  components/          # Feature components + shadcn/ui primitives in ui/
  lib/
    ai/                # Finance tools, chat history, message types
    supabase/server.ts # Per-request Supabase server client
    prisma.ts          # Prisma client on a pooled pg connection
    dal.ts             # Data access layer / current-user lookup
  proxy.ts             # Session refresh + route protection
  schemas/             # Zod schemas
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+
- **pnpm** (`npm i -g pnpm`)
- A **PostgreSQL** database (Supabase, Neon, or local)
- A **Supabase** project for authentication
- A **Groq API key** from the [Groq Console](https://console.groq.com/keys)

### 1. Clone and install

```bash
git clone https://github.com/aasifdemand/AI-Finance-Manager.git
cd AI-Finance-Manager
pnpm install
```

`pnpm install` also runs `prisma generate`, which writes the client to `src/generated/prisma`.

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# PostgreSQL connection string. With Supabase, use the pooler URL: the app automatically
# switches *.pooler.supabase.com:5432 (session mode) to :6543 (transaction mode) at runtime,
# so serverless instances don't exhaust the session pool (EMAXCONNSESSION).
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Optional: connection used by `prisma migrate` (direct or session-mode URL). Defaults to DATABASE_URL.
# DIRECT_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Optional: max connections per server instance (default 3 in production, 5 in dev)
# DATABASE_POOL_MAX=3

# Public URL of the app (used for auth redirects)
APP_URL=http://localhost:3000

# Supabase Auth
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."

# Groq
GROQ_API_KEY="gsk_..."
GROQ_MODEL="openai/gpt-oss-120b"   # optional, this is the default
```

### 3. Configure Supabase Auth

In your Supabase dashboard:

1. **Authentication → URL Configuration**: set the Site URL to your `APP_URL` and add `http://localhost:3000/auth/callback` (plus your production `/auth/callback` URL) to the redirect allow list.
2. **Authentication → Providers**: enable Email.

App users are stored in the `User` table and linked to Supabase Auth through `User.authId`.

### 4. Set up the database

```bash
pnpm prisma migrate deploy
```

Optionally load sample data:

```bash
pnpm db:seed
```

The seed script creates a single user plus accounts, transactions, budgets and goals. Edit the email in `prisma/seed.ts` to match the address you'll sign in with, because the record is linked to Supabase Auth by email on first sign-in.

### 5. Run the app

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Generate the Prisma client and build for production |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:seed` | Seed the database with sample data |

---

## 🧠 How the AI Advisor Works

```
User message ──► POST /api/chat
                   │  verifies the Supabase session
                   │  loads recent history from the AiMessage table
                   ▼
              streamText (Groq model)
                   │  calls finance tools as needed
                   ▼
              Prisma queries, always filtered by the signed-in user's id
                   │
                   ▼
              Markdown answer streamed to the drawer, then saved to AiMessage
```

The tools are created per request with the signed-in user's id baked in (`createFinanceTools(userId)`), so the model never chooses whose data it reads.

---

## 🚢 Deployment

1. Push the repository to GitHub and import it into [Vercel](https://vercel.com).
2. Add the environment variables from step 2 under **Project Settings → Environment Variables**, with `APP_URL` set to your production URL.
3. Add the production `/auth/callback` URL to Supabase's redirect allow list.
4. Run `pnpm prisma migrate deploy` against the production database.
5. Deploy. The `build` script runs `prisma generate` before `next build`.

---

## 📄 License

MIT. Built by [Aasif Ali](https://github.com/aasifdemand).
