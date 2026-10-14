"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, getToolName } from "ai";
import { Streamdown } from "streamdown";
import {
  AlertCircle,
  ArrowUp,
  Bot,
  Check,
  Loader2,
  PieChart,
  RotateCcw,
  Square,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { cn } from "@/lib/utils";
import {
  clearAiConversationHistory,
  getAiConversationHistory,
} from "@/actions/ai-advisor";
import { MAX_PROMPT_LENGTH, type AdvisorUIMessage } from "@/lib/ai/types";

const SUGGESTIONS = [
  { icon: PieChart, title: "Where did my money go?", prompt: "Where did I spend the most money this month?" },
  { icon: Target, title: "Budget check", prompt: "Compare my spending against my budgets this month" },
  { icon: TrendingUp, title: "Monthly health", prompt: "How am I doing this month — income, expenses and savings rate?" },
  { icon: Wallet, title: "Goals & net worth", prompt: "How can I reach my savings goals faster?" },
];

const TOOL_LABELS: Record<string, { running: string; done: string }> = {
  getCashflowSummary: { running: "Summing income & expenses", done: "Checked cashflow" },
  getCategoryBreakdown: { running: "Breaking down categories", done: "Analysed categories" },
  getTopMerchants: { running: "Ranking merchants", done: "Ranked merchants" },
  getBudgetStatus: { running: "Checking budgets", done: "Checked budgets" },
  searchTransactions: { running: "Searching transactions", done: "Searched transactions" },
  getAccountsAndGoals: { running: "Reading accounts & goals", done: "Read accounts & goals" },
};

const transport = new DefaultChatTransport<AdvisorUIMessage>({
  api: "/api/chat",
  // Only the new message travels; the server owns the history
  prepareSendMessagesRequest: ({ messages }) => ({
    body: { message: messages[messages.length - 1] },
  }),
});

const AVATAR_SIZES = {
  sm: { box: "h-7 w-7 rounded-full", icon: "h-4 w-4" },
  md: { box: "h-8 w-8 rounded-xl", icon: "h-[18px] w-[18px]" },
  lg: { box: "h-14 w-14 rounded-2xl", icon: "h-7 w-7" },
};

function AdvisorAvatar({ size = "sm", className }: { size?: keyof typeof AVATAR_SIZES; className?: string }) {
  const s = AVATAR_SIZES[size];
  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary text-primary-foreground shadow-sm shadow-primary/25",
        s.box,
        className,
      )}
    >
      <Bot className={s.icon} strokeWidth={2} />
    </div>
  );
}

function ToolStatus({ part }: { part: AdvisorUIMessage["parts"][number] }) {
  if (!isToolUIPart(part)) return null;
  const name = getToolName(part);
  const labels = TOOL_LABELS[name] ?? { running: "Fetching data", done: "Fetched data" };
  const failed = part.state === "output-error";
  const done = part.state === "output-available";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium",
        failed
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-border bg-muted/60 text-muted-foreground",
      )}
    >
      {failed ? (
        <AlertCircle className="h-3 w-3" />
      ) : done ? (
        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
      ) : (
        <Loader2 className="h-3 w-3 animate-spin" />
      )}
      {failed ? `Couldn't ${labels.running.toLowerCase()}` : done ? labels.done : `${labels.running}…`}
    </span>
  );
}

function AssistantMessage({
  message,
  isStreaming,
}: {
  message: AdvisorUIMessage;
  isStreaming: boolean;
}) {
  const toolParts = message.parts.filter(isToolUIPart);
  const text = message.parts
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("");

  return (
    <div className="flex gap-3">
      <AdvisorAvatar className="mt-0.5" />
      <div className="min-w-0 flex-1 space-y-2.5">
        {toolParts.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {toolParts.map((part) => (
              <ToolStatus key={part.toolCallId} part={part} />
            ))}
          </div>
        )}
        {text ? (
          <Streamdown
            isAnimating={isStreaming}
            caret={isStreaming ? "block" : undefined}
            className="advisor-prose text-sm leading-relaxed text-foreground"
          >
            {text}
          </Streamdown>
        ) : isStreaming && toolParts.length === 0 ? (
          <ThinkingDots />
        ) : null}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex h-6 items-center gap-1" aria-label="Thinking">
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex flex-col items-center px-2 pt-6 pb-2 text-center">
      <AdvisorAvatar size="lg" className="mb-4" />
      <h3 className="font-heading text-base font-semibold tracking-tight">
        Ask about your money
      </h3>
      <p className="mt-1 max-w-72 text-xs leading-relaxed text-muted-foreground">
        I read your live transactions, budgets, accounts and goals to give
        answers grounded in your real numbers.
      </p>
      <div className="mt-5 grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map(({ icon: Icon, title, prompt }) => (
          <button
            key={title}
            type="button"
            onClick={() => onPick(prompt)}
            className="group flex items-start gap-2.5 rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-primary/30 hover:bg-primary/[0.03] cursor-pointer"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            <span className="min-w-0">
              <span className="block text-xs font-medium text-foreground">{title}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground line-clamp-2">
                {prompt}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function AiAdvisorDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { messages, setMessages, sendMessage, status, stop, error, regenerate, clearError } =
    useChat<AdvisorUIMessage>({ transport });

  const isBusy = status === "submitted" || status === "streaming";
  const lastMessage = messages[messages.length - 1];

  // Load saved history the first time the drawer opens
  useEffect(() => {
    if (!isOpen || historyLoaded) return;
    let cancelled = false;
    getAiConversationHistory()
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .finally(() => {
        if (!cancelled) setHistoryLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, historyLoaded, setMessages]);

  useEffect(() => {
    if (!isOpen) return;
    textareaRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // Auto-grow the textarea up to ~5 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [input]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBusy || !historyLoaded) return;
    if (error) clearError();
    sendMessage({ text: trimmed.slice(0, MAX_PROMPT_LENGTH) });
    setInput("");
  }

  async function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
      return;
    }
    stop();
    await clearAiConversationHistory();
    setMessages([]);
    setConfirmClear(false);
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close Rupiq AI" : "Open Rupiq AI"}
        aria-expanded={isOpen}
        className={cn(
          "fixed right-4 bottom-4 z-40 flex h-12 items-center gap-2 rounded-full bg-primary pr-5 pl-4 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 ring-1 ring-white/10 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 active:translate-y-0 sm:right-6 sm:bottom-6 cursor-pointer",
          isOpen && "max-sm:hidden",
        )}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Bot className="h-[18px] w-[18px]" />}
        <span>{isOpen ? "Close" : "Ask Rupiq"}</span>
      </button>

      {isOpen && (
        <section
          role="dialog"
          aria-label="Rupiq AI"
          className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-background animate-in fade-in slide-in-from-bottom-4 duration-200 sm:inset-auto sm:right-6 sm:bottom-22 sm:h-[min(680px,calc(100dvh-8rem))] sm:w-[420px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl"
        >
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <AdvisorAvatar size="md" />
              <div className="min-w-0 leading-tight">
                <p className="font-heading text-sm font-semibold tracking-tight">
                  Rupiq AI
                </p>
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  </span>
                  Connected to your live data
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className={cn(
                    "h-8 gap-1.5 rounded-full px-2.5 text-xs text-muted-foreground cursor-pointer",
                    confirmClear && "bg-destructive/10 text-destructive hover:bg-destructive/15 hover:text-destructive",
                  )}
                  title="Clear conversation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {confirmClear ? "Confirm" : <span className="sr-only">Clear</span>}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="rounded-full cursor-pointer"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Conversation */}
          <MessageScrollerProvider>
            <MessageScroller className="min-h-0 flex-1">
              <MessageScrollerViewport className="px-4 py-5">
                <MessageScrollerContent className="gap-6">
                  {!historyLoaded ? (
                    <div className="flex h-60 flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      Loading your conversation…
                    </div>
                  ) : messages.length === 0 ? (
                    <EmptyState onPick={send} />
                  ) : (
                    messages.map((m) => (
                      <MessageScrollerItem key={m.id}>
                        {m.role === "user" ? (
                          <div className="flex justify-end">
                            <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground shadow-xs">
                              {m.parts.map((p) => (p.type === "text" ? p.text : "")).join("")}
                            </div>
                          </div>
                        ) : (
                          <AssistantMessage
                            message={m}
                            isStreaming={status === "streaming" && m.id === lastMessage?.id}
                          />
                        )}
                      </MessageScrollerItem>
                    ))
                  )}

                  {status === "submitted" && lastMessage?.role === "user" && (
                    <MessageScrollerItem>
                      <div className="flex gap-3">
                        <AdvisorAvatar />
                        <ThinkingDots />
                      </div>
                    </MessageScrollerItem>
                  )}

                  {error && (
                    <MessageScrollerItem>
                      <div className="flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-xs text-destructive">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <div className="flex-1 space-y-2">
                          <p>{readableError(error)}</p>
                          <button
                            type="button"
                            onClick={() => regenerate()}
                            className="inline-flex items-center gap-1 font-medium underline-offset-2 hover:underline cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" /> Try again
                          </button>
                        </div>
                      </div>
                    </MessageScrollerItem>
                  )}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton className="rounded-full" />
            </MessageScroller>
          </MessageScrollerProvider>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="shrink-0 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
          >
            <div className="flex items-end gap-2 rounded-2xl border border-input bg-muted/40 p-1.5 pl-3.5 transition-colors focus-within:border-ring focus-within:bg-background">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                maxLength={MAX_PROMPT_LENGTH}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder="Ask about spending, budgets, goals…"
                aria-label="Message Rupiq AI"
                className="max-h-33 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              {isBusy ? (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() => stop()}
                  className="h-9 w-9 shrink-0 rounded-xl cursor-pointer"
                  aria-label="Stop generating"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || !historyLoaded}
                  className="h-9 w-9 shrink-0 rounded-xl cursor-pointer"
                  aria-label="Send"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="mt-1.5 px-1 text-center text-[10px] text-muted-foreground">
              AI can make mistakes — double-check important numbers.
            </p>
          </form>
        </section>
      )}
    </>
  );
}

function readableError(error: Error) {
  // The route returns JSON { error } for request-level failures
  try {
    const parsed = JSON.parse(error.message);
    if (typeof parsed?.error === "string") return parsed.error;
  } catch {
    // not JSON
  }
  return error.message || "Something went wrong. Please try again.";
}
