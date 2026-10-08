"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  PieChart,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
  Activity,
  CreditCard,
  Target,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AppLogo } from "@/components/shared/app-logo";

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -40]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.8]);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20 overflow-x-hidden"
    >
      {/* Dynamic Animated Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-200 h-137.5 bg-linear-to-tr from-primary/15 via-primary/5 to-transparent rounded-full blur-3xl opacity-70 animate-pulse" />
        <div className="absolute top-[40%] -left-40 w-150 h-150 bg-primary/10 rounded-full blur-[140px] opacity-50" />
        <div className="absolute top-[70%] -right-40 w-162.5 h-162.5 bg-primary/10 rounded-full blur-[140px] opacity-40" />
        {/* Subtle dot matrix grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.15] dark:opacity-[0.25]"
          style={{
            backgroundImage:
              "radial-gradient(color-mix(in oklch, var(--foreground) 15%, transparent) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* 1. Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AppLogo size="md" />
            <Badge
              variant="outline"
              className="hidden sm:inline-flex text-[10px] uppercase tracking-wider font-semibold border-primary/30 text-primary rounded-full px-2 py-0.5"
            >
              AI Copilot
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#ai-copilot"
              className="hover:text-foreground transition-colors"
            >
              AI Copilot
            </a>
            <a
              href="#security"
              className="hover:text-foreground transition-colors"
            >
              Security
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* 2. Hero Section (Full viewport height focus) */}
        <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center pt-8 pb-16 md:pt-14 md:pb-24">
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="container mx-auto max-w-7xl px-4 sm:px-6 text-center flex flex-col items-center"
          >
            {/* Pill Announcement */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary mb-6 shadow-xs backdrop-blur-md"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Next-Gen Financial Intelligence & Advisory</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] sm:leading-[1.08]"
            >
              Master your wealth with{" "}
              <span className="bg-linear-to-r from-primary via-primary/85 to-primary/60 bg-clip-text text-transparent drop-shadow-xs">
                intelligent analytics.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
            >
              Track multi-account transactions, manage budgets with live
              utilization alerts, set savings goals, and ask our
              LangGraph-powered AI Copilot for deterministic financial insights.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-none"
            >
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center rounded-xl border border-border/80 bg-card/80 px-8 text-base font-semibold text-foreground shadow-sm backdrop-blur-md transition-all hover:bg-muted hover:border-primary/40 hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </Link>
            </motion.div>

            {/* Micro value tags */}
            <motion.div
              custom={4}
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Free to
                use
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> PostgreSQL
                Secured
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Sub-second
                AI Engine
              </span>
            </motion.div>

            {/* Dynamic Dashboard Glassmorphic Preview Window */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
              className="mt-14 w-full max-w-5xl rounded-2xl border border-border/80 bg-card/70 p-3.5 shadow-2xl backdrop-blur-2xl transition-all hover:shadow-primary/5 hover:border-primary/30"
            >
              {/* Window Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3 px-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-foreground/70">
                    rupiq.app/dashboard
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <Badge
                    variant="secondary"
                    className="text-[10px] rounded-full font-medium"
                  >
                    Live Production View
                  </Badge>
                </div>
              </div>

              {/* Sample Dashboard Widgets with Clean INR currency symbols */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 p-3 text-left">
                <div className="rounded-xl border border-border/60 bg-background/60 p-4.5 transition-all hover:border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Total Net Worth</span>
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold mt-1.5 text-foreground tracking-tight">
                    ₹24,80,500
                  </p>
                  <span className="text-[11px] text-emerald-600 font-semibold mt-1 inline-block">
                    ↑ +14.2% this quarter
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/60 p-4.5 transition-all hover:border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Monthly Expenses</span>
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold mt-1.5 text-foreground tracking-tight">
                    ₹78,450
                  </p>
                  <span className="text-[11px] text-muted-foreground mt-1 inline-block">
                    62% of monthly budget limit
                  </span>
                </div>

                <div className="rounded-xl border border-border/60 bg-background/60 p-4.5 transition-all hover:border-border">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Active Savings Goals</span>
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-2xl font-bold mt-1.5 text-foreground tracking-tight">
                    4 In Progress
                  </p>
                  <span className="text-[11px] text-primary font-semibold mt-1 inline-block">
                    ₹3,50,000 target
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* 3. Core Feature Grid with Scroll Animation */}
        <section
          id="features"
          className="py-24 bg-muted/20 border-y border-border/40 relative"
        >
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <Badge
                variant="outline"
                className="mb-3 text-xs uppercase tracking-wider font-semibold rounded-full"
              >
                Features
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Everything you need to master your wealth
              </h2>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground">
                Engineered for speed, scale, and crystal-clear visibility into
                your personal cashflow.
              </p>
            </div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: Layers,
                  title: "Multi-Account Management",
                  desc: "Connect Bank Accounts, Cash Wallets, Credit Cards, and Investment Portfolios with live atomic balance syncing.",
                },
                {
                  icon: PieChart,
                  title: "Category Budgets & Alerts",
                  desc: "Set monthly limits on Food, Housing, Utilities, and Travel with real-time visual utilization progress bars.",
                },
                {
                  icon: TrendingUp,
                  title: "Goal Target Tracking",
                  desc: "Define savings milestones (Emergency Fund, New Car, Vacations) and watch your progress update dynamically.",
                },
                {
                  icon: Zap,
                  title: "High Scale Server Pagination",
                  desc: "Built with Shadcn numbered pagination, debounced searching, and SQL aggregations designed to scale effortlessly.",
                },
                {
                  icon: FileSpreadsheet,
                  title: "PDF & Excel Financial Reports",
                  desc: "Export custom monthly financial statements in PDF format or raw Excel spreadsheets (.xlsx) with a single click.",
                },
                {
                  icon: Shield,
                  title: "Enterprise Security",
                  desc: "Supabase Auth with secure cookie sessions, email verification, Google sign-in, and strict per-user data isolation.",
                },
              ].map((feature, idx) => (
                <motion.div key={idx} variants={fadeIn}>
                  <Card className="h-full border-border/60 bg-card/60 rounded-2xl backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 shadow-xs">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <CardTitle className="text-lg font-bold">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-sm leading-relaxed text-muted-foreground mt-1.5">
                        {feature.desc}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* 4. AI Copilot Spotlight Section */}
        <section id="ai-copilot" className="py-24 relative overflow-hidden">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary mb-4">
                  <Bot className="h-3.5 w-3.5" />
                  <span>LangGraph Multi-Agent Architecture</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                  Ask your money anything. Get deterministic facts.
                </h2>
                <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
                  Our embedded AI Copilot doesn't guess or hallucinate. It
                  executes native PostgreSQL analytics to calculate exact
                  spending trends, top vendors, and over-budget warnings in
                  milliseconds.
                </p>

                <div className="mt-8 space-y-4 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Intent Recognition:</strong> Accurately identifies
                      whether you are asking about vendors, categories, or
                      budgets.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Persistent Chat History:</strong> Saved per-user
                      in PostgreSQL with zero unnecessary token burn.
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>
                      <strong>Sub-Second Execution:</strong> Powered by Groq LPU
                      inference combined with native SQL aggregation.
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/signup"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02]"
                  >
                    Try Rupiq AI <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

              {/* Chat Interface Interactive Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <AppLogo size="sm" />
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Rupiq AI
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Deterministic PostgreSQL analytics
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3.5 text-xs">
                  <div className="flex justify-end">
                    <div className="rounded-2xl rounded-br-xs bg-primary text-primary-foreground px-4 py-2.5 max-w-[85%] font-medium shadow-xs">
                      Where did I spend more money this month?
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="rounded-2xl rounded-tl-xs bg-muted/80 text-foreground px-4 py-3 max-w-[92%] leading-relaxed border border-border/50 shadow-xs">
                      <p className="font-semibold text-foreground mb-1.5">
                        Key takeaway: You spent the most on EMI and Housing.
                      </p>
                      <p className="text-muted-foreground">
                        • <strong>EMI:</strong> ₹1,53,408 (21% of total
                        spend)
                      </p>
                      <p className="text-muted-foreground">
                        • <strong>Housing:</strong> ₹1,41,298 (19.4% of
                        total spend)
                      </p>
                      <p className="mt-2 text-[11px] text-primary italic font-medium">
                        ↳ Tip: Review loan consolidation options to lower
                        interest over time.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 5. Call to Action Banner */}
        <section className="py-20 bg-linear-to-br from-primary via-primary/95 to-primary/85 text-primary-foreground relative overflow-hidden">
          <div className="container mx-auto max-w-5xl px-4 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              Ready to take control of your financial future?
            </h2>
            <p className="mt-4 text-base sm:text-lg opacity-90 max-w-xl mx-auto leading-relaxed">
              Create an account in under 30 seconds or sign in to your live
              dashboard.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-background px-8 text-base font-bold text-foreground shadow-2xl transition-all hover:bg-background/90 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started for Free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 6. Footer */}
      <footer className="border-t border-border/40 py-10 bg-muted/10 text-xs text-muted-foreground">
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <AppLogo size="sm" />
            <span className="text-muted-foreground">
              &copy; {new Date().getFullYear()} Rupiq. All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-6 font-medium">
            <Link
              href="/login"
              className="hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="hover:text-foreground transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/forgot-password"
              className="hover:text-foreground transition-colors"
            >
              Reset Password
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
