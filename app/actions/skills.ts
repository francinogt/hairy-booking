"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getMyStaff, requireOwner, requireRole } from "@/lib/auth/dal";
import { createSkill, setStaffSkills, uniqueSkillSlug, updateSkill } from "@/data/skills";

export type SkillState = { error?: string; success?: boolean } | undefined;

const skillSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich").max(80),
  description: z.string().trim().max(255).optional(),
});

export async function createSkillAction(_prev: SkillState, formData: FormData): Promise<SkillState> {
  await requireOwner();
  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { error: "Name ist erforderlich." };
  const slug = await uniqueSkillSlug(parsed.data.name);
  await createSkill({ name: parsed.data.name, slug, description: parsed.data.description ?? null });
  revalidatePath("/admin/skills");
  return { success: true };
}

export async function toggleSkillAction(formData: FormData): Promise<void> {
  await requireOwner();
  const id = Number(formData.get("skillId"));
  const active = formData.get("active") === "true";
  if (!Number.isFinite(id)) return;
  await updateSkill(id, { isActive: active });
  revalidatePath("/admin/skills");
}

export async function saveMyStaffSkillsAction(
  _prev: SkillState,
  formData: FormData,
): Promise<SkillState> {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  if (!my) return { error: "Bitte lege zuerst dein Mitarbeiter-Profil an." };
  const ids = formData
    .getAll("skillIds")
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  await setStaffSkills(my.id, ids);
  revalidatePath("/admin/profile");
  return { success: true };
}
