import "server-only";

import { prisma } from "@/lib/prisma";
import type { AdvisorUIMessage } from "./types";

const HISTORY_LIMIT = 40;

export async function loadAdvisorHistory(userId: number): Promise<AdvisorUIMessage[]> {
  // Newest N, returned oldest-first
  const rows = await prisma.aiMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: HISTORY_LIMIT,
  });

  return rows.reverse().map((m) => ({
    id: m.id,
    role: m.role === "user" ? "user" : "assistant",
    parts: Array.isArray(m.parts)
      ? (m.parts as AdvisorUIMessage["parts"])
      : [{ type: "text", text: m.content }],
  }));
}
