import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
} from "ai";
import { groq } from "@ai-sdk/groq";
import { z } from "zod";
import { getCurrentUser } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { createFinanceTools } from "@/lib/ai/finance-tools";
import { MAX_PROMPT_LENGTH, type AdvisorUIMessage } from "@/lib/ai/types";
import { loadAdvisorHistory } from "@/lib/ai/history";

export const maxDuration = 60;

// The client sends only the new user message; history is loaded from the DB
// so it can't be tampered with.
const RequestSchema = z.object({
  message: z.object({
    id: z.string().min(1).max(64),
    role: z.literal("user"),
    parts: z
      .array(z.object({ type: z.literal("text"), text: z.string() }))
      .min(1),
  }),
});

const HISTORY_FOR_MODEL = 12;

function buildInstructions(today: Date) {
  const iso = today.toISOString().slice(0, 10);
  const month = today.getMonth() + 1;
  return `You are Rupiq AI, a sharp, friendly personal finance advisor for an Indian user.
Today is ${iso} (month ${month}, year ${today.getFullYear()}).

How to work:
- ALWAYS call a tool to get real numbers before answering questions about the user's money. Never invent figures.
- Resolve relative dates yourself ("this month" = month ${month}; "last month" = the previous month, wrapping the year).
- Call several tools if a question needs it (e.g. cashflow + budgets for "how am I doing").
- If a tool returns no data, say so plainly and suggest what the user could add.

How to answer (Markdown):
- Answer only what was asked. No greetings, preamble, recaps, disclaimers or follow-up offers.
- Lead with the direct answer in one sentence, with the key figure in **bold**.
- If the question asks for one figure, reply with that one sentence only — no bullets, no extra numbers.
- Otherwise add at most 3 short bullets, each carrying a number the user needs.
- Give a tip only if the user asks for advice or a figure clearly needs action — one line, max.
- Never list figures the user didn't ask about, and never repeat raw tool output.
- Format money in INR with Indian digit grouping, e.g. ₹1,25,000. Round to whole rupees.
- Use category names in plain words (e.g. "Online shopping", not ONLINE_SHOPPING).
- Stay under 80 words unless the user explicitly asks for detail.`;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Not signed in" }, { status: 401 });
  }

  if (!process.env.GROQ_API_KEY) {
    return Response.json(
      { error: "The AI advisor is not configured. Set GROQ_API_KEY in your environment." },
      { status: 503 },
    );
  }

  const parsed = RequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const text = parsed.data.message.parts.map((p) => p.text).join("\n").trim();
  if (!text || text.length > MAX_PROMPT_LENGTH) {
    return Response.json(
      { error: `Messages must be between 1 and ${MAX_PROMPT_LENGTH} characters.` },
      { status: 400 },
    );
  }

  const userMessage: AdvisorUIMessage = {
    id: parsed.data.message.id,
    role: "user",
    parts: [{ type: "text", text }],
  };

  const askedAt = new Date();
  // On retry the same user message may already be stored — drop it (and anything after) from history
  const stored = await loadAdvisorHistory(user.id);
  const retryIndex = stored.findIndex((m) => m.id === userMessage.id);
  const history = retryIndex === -1 ? stored : stored.slice(0, retryIndex);
  const messages = [...history, userMessage];

  // Past turns go to the model as text only — old tool payloads just burn tokens
  const modelHistory = messages.slice(-HISTORY_FOR_MODEL).map((m) => ({
    ...m,
    parts: m.parts.filter((p) => p.type === "text"),
  }));

  const result = streamText({
    model: groq(process.env.GROQ_MODEL || "openai/gpt-oss-120b"),
    instructions: buildInstructions(new Date()),
    messages: await convertToModelMessages(modelHistory),
    tools: createFinanceTools(user.id),
    stopWhen: isStepCount(5),
    temperature: 0.3,
    // Reasoning tokens count toward this cap, so keep reasoning light
    maxOutputTokens: 600,
    providerOptions: { groq: { reasoningEffort: "low" } },
  });

  // Keep generating (and saving) even if the user closes the drawer mid-stream
  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onError: (error) => {
        console.error("AI advisor stream error:", error);
        const message = error instanceof Error ? error.message : String(error);
        if (/api key|unauthorized|401/i.test(message)) {
          return "The AI provider rejected the API key. Check GROQ_API_KEY.";
        }
        if (/does not exist|decommissioned|model_not_found/i.test(message)) {
          return "The configured AI model is unavailable. Check GROQ_MODEL.";
        }
        if (/rate limit|429/i.test(message)) {
          return "The AI provider is rate-limiting requests. Please try again in a moment.";
        }
        return "Something went wrong while analysing your finances. Please try again.";
      },
      onEnd: async ({ responseMessage, isAborted }) => {
        const responseText = responseMessage.parts
          .map((p) => (p.type === "text" ? p.text : ""))
          .join("")
          .trim();

        const rows = [
          {
            id: userMessage.id,
            userId: user.id,
            role: "user",
            content: text,
            parts: userMessage.parts,
            createdAt: askedAt,
          },
        ];
        if (responseText || !isAborted) {
          rows.push({
            id: responseMessage.id,
            userId: user.id,
            role: "assistant",
            content: responseText,
            parts: responseMessage.parts,
            createdAt: new Date(Math.max(Date.now(), askedAt.getTime() + 1)),
          });
        }

        const superseded = retryIndex === -1 ? [] : stored.slice(retryIndex + 1).map((m) => m.id);

        try {
          if (superseded.length) {
            await prisma.aiMessage.deleteMany({ where: { userId: user.id, id: { in: superseded } } });
          }
          // skipDuplicates: client-supplied ids can never overwrite existing rows
          await prisma.aiMessage.createMany({
            data: rows.map((r) => ({ ...r, parts: JSON.parse(JSON.stringify(r.parts)) })),
            skipDuplicates: true,
          });
        } catch (err) {
          console.error("Failed to save AI conversation:", err);
        }
      },
    }),
  });
}
