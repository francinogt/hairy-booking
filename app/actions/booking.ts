"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { computeFreeSlots } from "@/data/slots";

const slotsSchema = z.object({
  staffId: z.number().int().positive(),
  durationMin: z.number().int().positive().max(24 * 60),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type SlotsResult =
  | { ok: true; slots: Record<string, string[]> }
  | { ok: false; error: string };

export async function getAvailableSlots(input: {
  staffId: number;
  durationMin: number;
  fromDate: string;
  toDate: string;
}): Promise<SlotsResult> {
  await requireUser();
  const parsed = slotsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ungültige Anfrage." };
  const slots = await computeFreeSlots(parsed.data);
  return { ok: true, slots };
}
