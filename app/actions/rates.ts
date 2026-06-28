"use server";

import { revalidatePath } from "next/cache";
import { getMyStaff, requireRole } from "@/lib/auth/dal";
import { listSkillIdsForStaff } from "@/data/skills";
import { replaceStaffRates } from "@/data/rates";

export type RatesState = { error?: string; success?: boolean } | undefined;

export async function saveStaffRates(_prev: RatesState, formData: FormData): Promise<RatesState> {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  if (!my) return { error: "Bitte lege zuerst dein Mitarbeiter-Profil an." };

  // Nur Saetze fuer Skills, die der Mitarbeiter wirklich hat (server-seitig abgeleitet).
  const skillIds = await listSkillIdsForStaff(my.id);
  const entries: { skillId: number; hourlyRate: string }[] = [];
  for (const skillId of skillIds) {
    const raw = String(formData.get(`rate_${skillId}`) ?? "").trim().replace(",", ".");
    if (raw === "") continue;
    const n = Number(raw);
    if (!Number.isFinite(n) || n < 0) {
      return { error: "Ungültiger Stundensatz. Bitte eine Zahl ≥ 0 eingeben." };
    }
    entries.push({ skillId, hourlyRate: n.toFixed(2) });
  }

  await replaceStaffRates(my.id, entries);
  revalidatePath("/admin/profile");
  return { success: true };
}
