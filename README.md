# 💰 Rupiq — AI-Powered Personal Finance & Wealth Management

A full-stack, enterprise-grade personal finance web application built with **Next.js 16 (Turbopack)**, **Prisma ORM (v7)**, **PostgreSQL (Neon)**, **LangGraph AI Multi-Agent Architecture**, **Groq LPU Inference**, and **Shadcn UI**.

---

## 🌟 Key Highlights & Capabilities

- **🤖 Rupiq AI**:
  - Deterministic multi-agent state machine (`@langchain/langgraph` + `@langchain/groq`).
  - Native PostgreSQL aggregation tools ($0\%$ hallucination).
  - Understands natural language queries for top vendors, monthly category breakdowns, budget utilization, and savings milestones.
  - Per-user PostgreSQL chat persistence with one-click history clearing.
- **⚡ High-Performance Architecture**:
  - Server-side PostgreSQL pagination with debounced search, category filters, and sorting.
  - Client-side in-memory page caching + background next-page prefetching.
  - Non-locking connection pooling (`pg.Pool`) configured for Neon Serverless PostgreSQL.
- **🔒 Enterprise-Grade Security**:
  - Google OAuth 2.0 with CSRF state protection.
  - Encrypted HTTP-only JWT session management via `jose`.
  - Secure bcrypt password hashing and token-based password reset via Nodemailer.
  - Protected Server Actions with strict user sandboxing (`verifySession`).
- **📊 Interactive Financial Dashboard**:
  - Dynamic **Weekly / Monthly / Yearly** cashflow switchers, 6-month historical trends, and category distribution pie charts.
  - Visual budget utilization progress bars with over-budget alerts.
  - Goal tracking with automated percentage completions.
- **📑 Financial Statements Export**:
  - Instant client-side generation of branded PDF statements and raw `.xlsx` Excel spreadsheets.
- **🎨 Modern UI & Accessibility**:
  - Dark / Light / System theme switching powered by `next-themes`.
  - Dynamic route breadcrumbs (`Rupiq > Dashboard`, `Rupiq > Transactions`, etc.).
  - Built with official Shadcn UI primitives (`<ScrollArea>`, `<Message>`, `<MessageScroller>`, `<Card>`, `<Avatar>`, `<Table>`, `<Pagination>`, `<Skeleton>`).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Server Actions, Turbopack) |
| **Language & Runtime** | TypeScript 5, React 19, Node.js 24 |
| **Styling & UI** | Tailwind CSS v4, Shadcn UI, Lucide Icons, Recharts |
| **Database & ORM** | PostgreSQL (Neon Database), Prisma ORM 7 (`@prisma/adapter-pg`) |
| **AI & LLM Orchestration** | LangGraph (`@langchain/langgraph`), Vercel AI SDK + Groq (`openai/gpt-oss-120b`) |
| **Authentication** | Google OAuth 2.0, Jose (JWT), Bcrypt.js |
| **Exports & Mail** | jsPDF, jsPDF-AutoTable, XLSX (SheetJS), Nodemailer |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** 20+ installed
- **pnpm** installed (`npm i -g pnpm`)
- A **PostgreSQL database** (e.g. Neon, Supabase, or local Postgres)
- A free **Groq API key** from [Groq Cloud Console](https://console.groq.com/keys)

### 2. Clone the Repository
```bash
git clone https://github.com/aasifdemand/AI-Finance-Manager.git
cd AI-Finance-Manager
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# ------------------------------------------------------------------------------
# 1. DATABASE CONFIGURATION (Neon PostgreSQL)
# ------------------------------------------------------------------------------
DATABASE_URL="postgresql://username:password@ep-your-pooler.region.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# ------------------------------------------------------------------------------
# 2. ENVIRONMENT & APP URL
# ------------------------------------------------------------------------------
NODE_ENV=development
APP_URL=http://localhost:3000

# ------------------------------------------------------------------------------
# 3. AUTHENTICATION & SECURITY SECRETS
# ------------------------------------------------------------------------------
SESSION_SECRET="your_long_random_session_secret_key_here"
RESET_TOKEN_SECRET="your_long_random_reset_token_secret_key_here"

# ------------------------------------------------------------------------------
# 4. GOOGLE OAUTH 2.0 CREDENTIALS
# ------------------------------------------------------------------------------
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# ------------------------------------------------------------------------------
# 5. GROQ AI ENGINE CONFIGURATION
# ------------------------------------------------------------------------------
GROQ_API_KEY="gsk_your_groq_api_key_here"
GROQ_MODEL="openai/gpt-oss-120b"

# ------------------------------------------------------------------------------
# 7. SMTP EMAIL CONFIGURATION (Password Resets)
# ------------------------------------------------------------------------------
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
SMTP_FROM="Rupiq <noreply@rupiq.local>"
```

### 5. Initialize the Database Schema
Push the schema directly to PostgreSQL:
```bash
pnpm prisma db push
pnpm prisma generate
```

### 6. Start the Development Server
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧠 LangGraph AI Copilot Architecture

The embedded Rupiq AI utilizes a decoupled **StateGraph** state machine:

```
[START] 
   │
   ▼
[intent_classifier]  ──► Extracts query type (top_merchants | category_breakdown | budget_audit | search)
   │
   ▼
[database_worker]    ──► Executes user-scoped Prisma aggregates on PostgreSQL (<10ms)
   │
   ▼
[financial_advisor]  ──► Synthesizes verified numbers into structured INR (₹) advice
   │
   ▼
 [END]               ──► Persists Q&A in PostgreSQL AiMessage table & streams to UI
```

---

## 🚢 Production Deployment on Vercel

1. Push your code to GitHub.
2. Import the repository into **[Vercel](https://vercel.com)**.
3. Configure all environment variables in **Project Settings > Environment Variables**.
4. Deploy! The `package.json` includes automated Prisma build scripts:
   ```json
   "postinstall": "prisma generate",
   "build": "prisma generate && next build"
   ```

---

## 📜 License

Distributed under the MIT License. Built with ❤️ by [Aasif Ali](https://github.com/aasifdemand).
