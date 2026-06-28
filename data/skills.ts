import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { skills, staffSkills, type Skill } from "@/db/schema";
import { slugify } from "@/data/staff";

export async function listSkills(opts?: { activeOnly?: boolean }): Promise<Skill[]> {
  const base = db.select().from(skills).orderBy(asc(skills.sortOrder), asc(skills.name));
  if (opts?.activeOnly) {
    return db
      .select()
      .from(skills)
      .where(eq(skills.isActive, true))
      .orderBy(asc(skills.sortOrder), asc(skills.name));
  }
  return base;
}

export async function getSkillById(id: number): Promise<Skill | null> {
  const rows = await db.select().from(skills).where(eq(skills.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function uniqueSkillSlug(name: string): Promise<string> {
  const start = slugify(name);
  let candidate = start;
  for (let n = 2; n < 100; n++) {
    const exists = await db.select({ id: skills.id }).from(skills).where(eq(skills.slug, candidate)).limit(1);
    if (exists.length === 0) return candidate;
    candidate = `${start}-${n}`;
  }
  return `${start}-${Date.now()}`;
}

export async function createSkill(input: {
  name: string;
  slug: string;
  description?: string | null;
  sortOrder?: number;
}): Promise<number> {
  const [{ id }] = await db
    .insert(skills)
    .values({
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      sortOrder: input.sortOrder ?? 0,
    })
    .$returningId();
  return id;
}

export async function updateSkill(
  id: number,
  values: Partial<{ name: string; description: string | null; isActive: boolean; sortOrder: number }>,
) {
  await db.update(skills).set(values).where(eq(skills.id, id));
}

export async function listSkillIdsForStaff(staffId: number): Promise<number[]> {
  const rows = await db
    .select({ skillId: staffSkills.skillId })
    .from(staffSkills)
    .where(eq(staffSkills.staffId, staffId));
  return rows.map((r) => r.skillId);
}

/** Ersetzt die Skills eines Mitarbeiters komplett (tx). */
export async function setStaffSkills(staffId: number, skillIds: number[]) {
  await db.transaction(async (tx) => {
    await tx.delete(staffSkills).where(eq(staffSkills.staffId, staffId));
    if (skillIds.length > 0) {
      await tx.insert(staffSkills).values(skillIds.map((skillId) => ({ staffId, skillId })));
    }
  });
}
