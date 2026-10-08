"use server";

import { verifySession } from "@/lib/dal";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const ProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
});

export async function updateProfile(
  _prevState: unknown,
  formData: FormData
) {
  const session = await verifySession();
  const userId = Number(session.userId);

  const parsed = ProfileSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: { name },
  });

  revalidatePath("/", "layout");
  return { success: true };
}
