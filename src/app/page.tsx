"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  PieChart,
  Shield,
  Sparkles,
  Target,
  Wallet,
  Send,
} from "lucide-react";
import { AppLogo } from "@/components/shared/app-logo";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: "easeOut" as const },
  }),
};

const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, margin: "-80px" },
} as const;

// Sample data for the hero mockup
const cashflow = [
  { m: "May", inc: 62, exp: 48 },
  { m: "Jun", inc: 70, exp: 55 },
  { m: "Jul", inc: 66, exp: 58 },
  { m: "Aug", inc: 78, exp: 52 },
  { m: "Sep", inc: 74, exp: 49 },
  { m: "Oct", inc: 88, exp: 54 },
];

const recentTx = [
  { emoji: "💼", name: "Salary — Acme Corp", cat: "Income", amt: "+₹1,20,000", credit: true },
  { emoji: "🛒", name: "BigBasket", cat: "Groceries", amt: "−₹3,420", credit: false },
  { emoji: "⚡", name: "Electricity bill", cat: "Utilities", amt: "−₹1,860", credit: false },
  { emoji: "☕", name: "Blue Tokai", cat: "Food", amt: "−₹540", credit: false },
];

const budgets = [
  { name: "Food & Dining", used: 72 },
  { name: "Transport", used: 45 },
  { name: "Shopping", used: 91 },
];

const steps = [
  {
    n: "01",
    title: "Add your accounts",
    desc: "Bank accounts, cash, credit cards and investments, all in one place with live balances.",
  },
  {
    n: "02",
    title: "Log transactions",
    desc: "Every credit and debit updates the right account balance instantly and atomically.",
  },
  {
    n: "03",
    title: "Plan and ask",
    desc: "Set budgets and goals, then ask Rupiq AI what changed, where money went, and what to do next.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <motion.div {...inView} variants={fadeUp} className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-4 text-base text-muted-foreground text-pretty sm:text-lg">{desc}</p>
      )}
    </motion.div>
  );
}

function HeroMockup() {
  const max = Math.max(...cashflow.flatMap((c) => [c.inc, c.exp]));
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Glow behind the window */}
      <div className="absolute -inset-x-10 -top-10 bottom-0 -z-10 rounded-[3rem] bg-primary/20 blur-3xl opacity-40 dark:opacity-30" />

      <div className="rounded-2xl border border-border/80 bg-card/80 p-2 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:p-3">
        {/* Window chrome */}
        <div className="flex items-center justify-between gap-3 px-2 pb-2.5 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
            <span className="size-2.5 rounded-full bg-foreground/15" />
          </div>
          <div className="truncate rounded-md bg-muted/70 px-3 py-1 font-mono text-[11px] text-muted-foreground">
            rupiq.app/dashboard
          </div>
          <div className="w-10" />
        </div>

        <div className="grid gap-2.5 rounded-xl border border-border/60 bg-background/80 p-3 text-left sm:gap-3 sm:p-4 lg:grid-cols-3">
          {/* Stat tiles */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:col-span-3">
            {[
              { label: "Net worth", value: "₹24,80,500", delta: "+14.2%", up: true, icon: Wallet },
              { label: "Income · Oct", value: "₹1,32,000", delta: "+8.1%", up: true, icon: ArrowUpRight },
              { label: "Spent · Oct", value: "₹78,450", delta: "−3.4%", up: false, icon: ArrowDownRight },
            ].map((s, i) => (
              <div
                key={s.label}
                className={cn(
                  "rounded-xl border border-border/60 bg-card p-3 sm:p-4",
                  i === 2 && "col-span-2 sm:col-span-1"
                )}
              >
                <div className="flex items-center justify-between text-[11px] font-medium text-muted-foreground sm:text-xs">
                  <span>{s.label}</span>
                  <s.icon className="size-3.5 text-primary" />
                </div>
                <p className="mt-1.5 text-lg font-bold tracking-tight tabular-nums sm:text-2xl">{s.value}</p>
                <span
                  className={cn(
                    "mt-0.5 inline-block text-[11px] font-semibold",
                    s.up ? "text-emerald-600 dark:text-emerald-400" : "text-primary"
                  )}
                >
                  {s.delta} vs last month
                </span>
              </div>
            ))}
          </div>

          {/* Cashflow chart */}
          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">Cashflow</p>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-emerald-500" /> Income
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-sm bg-primary" /> Expenses
                </span>
              </div>
            </div>
            <div className="mt-4 flex h-32 items-end justify-between gap-2 sm:h-40 sm:gap-4">
              {cashflow.map((c, i) => (
                <div key={c.m} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-full w-full items-end justify-center gap-0.5 sm:gap-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(c.inc / max) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.6 + i * 0.06, ease: "easeOut" }}
                      className="w-full max-w-4 rounded-t-[3px] bg-emerald-500/85"
                    />
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(c.exp / max) * 100}%` }}
                      transition={{ duration: 0.7, delay: 0.65 + i * 0.06, ease: "easeOut" }}
                      className="w-full max-w-4 rounded-t-[3px] bg-primary/85"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{c.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budgets */}
          <div className="rounded-xl border border-border/60 bg-card p-3 sm:p-4">
            <p className="text-xs font-semibold">Budgets · October</p>
            <div className="mt-4 space-y-3.5">
              {budgets.map((b, i) => (
                <div key={b.name}>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">{b.name}</span>
                    <span className={cn("font-semibold tabular-nums", b.used > 85 && "text-primary")}>
                      {b.used}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.used}%` }}
                      transition={{ duration: 0.8, delay: 0.8 + i * 0.1, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full",
                        b.used > 85 ? "bg-primary" : "bg-foreground/70"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent transactions — hidden on the smallest screens to keep the mockup compact */}
          <div className="hidden rounded-xl border border-border/60 bg-card p-3 sm:block sm:p-4 lg:col-span-3">
            <p className="text-xs font-semibold">Recent transactions</p>
            <div className="mt-2 divide-y divide-border/60">
              {recentTx.map((t) => (
                <div key={t.name} className="flex items-center gap-3 py-2">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-sm">
                    {t.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">{t.cat}</p>
                  </div>
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums",
                      t.credit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                    )}
                  >
                    {t.amt}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating AI insight card */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
        className="absolute -bottom-6 right-2 hidden w-72 rounded-2xl border border-border/80 bg-card/95 p-4 text-left shadow-xl backdrop-blur-xl md:block lg:-right-8"
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="flex size-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </span>
          Rupiq AI insight
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Shopping is at <strong className="text-foreground">91%</strong> of budget with 17 days left.
          Pausing weekend orders keeps you under by ~₹2,100.
        </p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-background text-foreground selection:bg-primary/20">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[900px] overflow-hidden">
        <div className="absolute left-1/2 top-[-280px] h-[600px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_22%,transparent),transparent)]" />
        <div
          className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]"
          style={{
            backgroundImage:
              "linear-gradient(to right, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 6%, transparent) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" aria-label="Rupiq home">
            <AppLogo size="md" />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a href="#ai" className="transition-colors hover:text-foreground">Rupiq AI</a>
            <a href="#security" className="transition-colors hover:text-foreground">Security</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground sm:px-4"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:px-4"
            >
              Get started <ArrowRight className="hidden size-4 sm:block" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 pb-24 pt-14 sm:px-6 md:pb-32 md:pt-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center text-center">
            <motion.a
              href="#ai"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/70 py-1 pl-1 pr-3 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur-md transition-colors hover:border-primary/40"
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                <Sparkles className="size-3" /> New
              </span>
              Rupiq AI now answers from your real numbers
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </motion.a>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-7 max-w-4xl text-4xl font-extrabold leading-[1.05] tracking-tight text-balance sm:text-6xl md:text-7xl"
            >
              Know where every{" "}
              <span className="relative whitespace-nowrap text-primary">
                rupee
                <svg
                  aria-hidden
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-2.5 w-full text-primary/40 sm:-bottom-2 sm:h-3"
                >
                  <path d="M2 9C50 3 150 3 198 9" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>{" "}
              goes.
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
            >
              Rupiq brings your accounts, budgets and savings goals into one clear dashboard, with an
              AI advisor that reads your actual transactions, not guesses.
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-9 flex w-full max-w-sm flex-col items-center gap-3 sm:max-w-none sm:flex-row sm:justify-center"
            >
              <Link
                href="/signup"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-7 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
              >
                Start for free <ArrowRight className="size-4" />
              </Link>
              <a
                href="#features"
                className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-border bg-card/80 px-7 text-base font-semibold shadow-xs backdrop-blur-md transition-colors hover:bg-muted sm:w-auto"
              >
                See how it works
              </a>
            </motion.div>

            <motion.ul
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
            >
              {["Free to use", "No bank login required", "Installable on your phone"].map((t) => (
                <li key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-500" /> {t}
                </li>
              ))}
            </motion.ul>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              className="mt-16 w-full"
            >
              <HeroMockup />
            </motion.div>
          </div>
        </section>

        {/* Stats strip */}
        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-4 sm:px-6 md:grid-cols-4">
            {[
              { k: "4", v: "account types: bank, cash, card, investment" },
              { k: "1-click", v: "PDF and Excel monthly reports" },
              { k: "Atomic", v: "balance updates on every transaction" },
              { k: "Per-user", v: "data isolation on every query" },
            ].map((s, i) => (
              <motion.div
                key={s.k}
                {...inView}
                custom={i}
                variants={fadeUp}
                className="px-2 py-8 text-center md:py-10"
              >
                <p className="text-2xl font-extrabold tracking-tight sm:text-3xl">{s.k}</p>
                <p className="mx-auto mt-1 max-w-[16rem] text-xs text-muted-foreground sm:text-sm">{s.v}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features — bento grid */}
        <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Features"
              title="Everything your money needs, nothing it doesn't"
              desc="Built for the way people in India actually manage money: multiple accounts, monthly budgets and a few big goals."
            />

            <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6">
              {/* Accounts — large */}
              <motion.div
                {...inView}
                variants={fadeUp}
                className="group relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-8 md:col-span-4"
              >
                <FeatureIcon icon={Layers} />
                <h3 className="mt-5 text-xl font-bold">All your accounts, one net worth</h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  Bank accounts, cash wallets, credit cards and investments. Every transaction moves the
                  right balance, so your net worth is always current.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {[
                    { n: "HDFC Savings", b: "₹3,42,800" },
                    { n: "Cash", b: "₹6,200" },
                    { n: "ICICI Card", b: "−₹18,450" },
                    { n: "Mutual Funds", b: "₹21,50,000" },
                  ].map((a) => (
                    <div
                      key={a.n}
                      className="rounded-xl border border-border/60 bg-background/70 p-3 transition-colors group-hover:border-border"
                    >
                      <p className="truncate text-[11px] text-muted-foreground">{a.n}</p>
                      <p className="mt-1 text-sm font-semibold tabular-nums">{a.b}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Budgets */}
              <motion.div
                {...inView}
                custom={1}
                variants={fadeUp}
                className="relative overflow-hidden rounded-3xl border border-border/70 bg-card p-6 sm:p-8 md:col-span-2"
              >
                <FeatureIcon icon={PieChart} />
                <h3 className="mt-5 text-xl font-bold">Budgets that warn you early</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Monthly limits per category with live utilisation, so you see trouble before the month ends.
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <svg viewBox="0 0 36 36" className="size-20 -rotate-90">
                    <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="4" className="stroke-muted" />
                    <motion.circle
                      cx="18"
                      cy="18"
                      r="15.5"
                      fill="none"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="stroke-primary"
                      strokeDasharray="97.4"
                      initial={{ strokeDashoffset: 97.4 }}
                      whileInView={{ strokeDashoffset: 97.4 * 0.38 }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: "easeOut" }}
                    />
                  </svg>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">62%</p>
                    <p className="text-xs text-muted-foreground">of October budget used</p>
                  </div>
                </div>
              </motion.div>

              {/* Goals */}
              <motion.div
                {...inView}
                custom={2}
                variants={fadeUp}
                className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 md:col-span-3"
              >
                <FeatureIcon icon={Target} />
                <h3 className="mt-5 text-xl font-bold">Goals you can see moving</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Emergency fund, a new car, that trip to Goa. Set a target and a date, then track progress.
                </p>
                <div className="mt-6 space-y-3">
                  {[
                    { n: "Emergency fund", p: 80 },
                    { n: "Goa trip", p: 35 },
                  ].map((g) => (
                    <div key={g.n}>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{g.n}</span>
                        <span className="font-semibold tabular-nums">{g.p}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${g.p}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full bg-emerald-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Reports */}
              <motion.div
                {...inView}
                custom={3}
                variants={fadeUp}
                className="rounded-3xl border border-border/70 bg-card p-6 sm:p-8 md:col-span-3"
              >
                <FeatureIcon icon={FileSpreadsheet} />
                <h3 className="mt-5 text-xl font-bold">Reports in one click</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Export any month as a clean PDF statement or a raw Excel sheet for your CA or your own analysis.
                </p>
                <div className="mt-6 flex gap-2">
                  {["PDF", "XLSX"].map((f) => (
                    <span
                      key={f}
                      className="rounded-lg border border-border/70 bg-background/70 px-3 py-1.5 font-mono text-xs font-semibold"
                    >
                      .{f.toLowerCase()}
                    </span>
                  ))}
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="scroll-mt-20 border-y border-border/50 bg-muted/30 px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="How it works" title="Set up in minutes, useful from day one" />
            <ol className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
              <div className="absolute left-[16%] right-[16%] top-6 hidden h-px bg-linear-to-r from-transparent via-border to-transparent md:block" />
              {steps.map((s, i) => (
                <motion.li
                  key={s.n}
                  {...inView}
                  custom={i}
                  variants={fadeUp}
                  className="relative flex flex-col items-center text-center"
                >
                  <span className="relative z-10 flex size-12 items-center justify-center rounded-full border border-border bg-background font-mono text-sm font-bold text-primary shadow-sm">
                    {s.n}
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{s.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* AI */}
        <section id="ai" className="scroll-mt-20 px-4 py-24 sm:px-6 md:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <motion.div {...inView} variants={fadeUp}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Rupiq AI</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                Ask your money anything.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Rupiq AI runs real queries against your own transactions, budgets and goals before it
                answers, so the numbers it quotes are the numbers in your account.
              </p>
              <ul className="mt-8 space-y-4 text-sm">
                {[
                  ["Grounded in your data", "Every figure comes from a query on your records, not a guess."],
                  ["Remembers the conversation", "Chat history is saved to your account so you can pick up later."],
                  ["Fast", "Served on Groq inference, so answers arrive in about a second."],
                ].map(([t, d]) => (
                  <li key={t} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                    <span className="text-muted-foreground">
                      <strong className="font-semibold text-foreground">{t}.</strong> {d}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              {...inView}
              custom={1}
              variants={fadeUp}
              className="rounded-3xl border border-border/80 bg-card p-4 shadow-2xl shadow-primary/5 sm:p-6"
            >
              <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold">Rupiq AI</p>
                  <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="size-1.5 rounded-full bg-emerald-500" /> Reading your October data
                  </p>
                </div>
              </div>

              <div className="space-y-4 py-5 text-sm">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 font-medium text-primary-foreground">
                    Where did most of my money go this month?
                  </div>
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-tl-md border border-border/60 bg-muted/60 px-4 py-3.5 leading-relaxed">
                  <p className="font-semibold">EMI and housing took 40% of your spending.</p>
                  <div className="mt-3 space-y-2">
                    {[
                      { c: "EMI", a: "₹1,53,408", p: 21 },
                      { c: "Housing", a: "₹1,41,298", p: 19 },
                      { c: "Food", a: "₹62,110", p: 9 },
                    ].map((r) => (
                      <div key={r.c} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-xs">
                        <span className="text-muted-foreground">{r.c}</span>
                        <div className="h-1.5 overflow-hidden rounded-full bg-background">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${r.p * 4}%` }} />
                        </div>
                        <span className="font-semibold tabular-nums">{r.a}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Tip: prepaying ₹50,000 on your car loan cuts about ₹6,800 of interest.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2">
                <span className="flex-1 truncate text-sm text-muted-foreground">Am I on track for my Goa trip?</span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Send className="size-3.5" />
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="scroll-mt-20 px-4 pb-24 sm:px-6 md:pb-32">
          <motion.div
            {...inView}
            variants={fadeUp}
            className="mx-auto grid max-w-7xl gap-8 rounded-3xl border border-border/70 bg-card p-6 sm:p-10 md:grid-cols-[auto_1fr] md:items-center md:gap-12"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Shield className="size-7" />
            </span>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your data stays yours</h2>
              <div className="mt-5 grid gap-x-8 gap-y-3 text-sm text-muted-foreground sm:grid-cols-2">
                {[
                  "Supabase Auth with email verification",
                  "Secure cookie-based sessions",
                  "Every query scoped to your user, nothing shared",
                  "No bank credentials asked for or stored",
                ].map((t) => (
                  <p key={t} className="flex gap-2.5">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> {t}
                  </p>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24 sm:px-6 md:pb-32">
          <motion.div
            {...inView}
            variants={fadeUp}
            className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground sm:px-12 md:py-20"
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl">
                Take control of your money this month.
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-base opacity-90 sm:text-lg">
                Create a free account in under 30 seconds. No card, no bank login.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-background px-8 text-base font-bold text-foreground shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
                >
                  Get started free <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-primary-foreground/30 px-8 text-base font-semibold transition-colors hover:bg-primary-foreground/10 sm:w-auto"
                >
                  I have an account
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-4 py-12 text-sm sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <AppLogo size="sm" />
            <p className="mt-3 text-muted-foreground">
              Personal finance, budgets and goals, with an AI advisor that knows your numbers.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:gap-16">
            <div>
              <p className="font-semibold">Product</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">Features</a></li>
                <li><a href="#ai" className="hover:text-foreground">Rupiq AI</a></li>
                <li><a href="#security" className="hover:text-foreground">Security</a></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold">Account</p>
              <ul className="mt-3 space-y-2 text-muted-foreground">
                <li><Link href="/signup" className="hover:text-foreground">Create account</Link></li>
                <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
                <li><Link href="/forgot-password" className="hover:text-foreground">Reset password</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-7xl border-t border-border/50 pt-6 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Rupiq. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

function FeatureIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
      <Icon className="size-5" />
    </span>
  );
}
