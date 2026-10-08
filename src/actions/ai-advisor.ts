"use server";

import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { loadAdvisorHistory } from "@/lib/ai/history";

// Responses are streamed from /api/chat (Vercel AI SDK); these actions manage stored history.

export async function getAiConversationHistory() {
  const session = await verifySession();

  try {
    return await loadAdvisorHistory(Number(session.userId));
  } catch (err) {
    console.error("Failed to load AI history:", err);
    return [];
  }
}

export async function clearAiConversationHistory() {
  const session = await verifySession();

  await prisma.aiMessage.deleteMany({
    where: { userId: Number(session.userId) },
  });

  return { success: true };
}
