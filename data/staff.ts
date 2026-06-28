import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  staffProfiles,
  staffSkills,
  staffStyleRates,
  users,
  type StaffProfile,
} from "@/db/schema";

/** URL-sicherer Slug (Umlaute -> ae/oe/ue, Rest entfernt). */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "mitarbeiter";
}

/** Garantiert eindeutigen Slug (haengt -2, -3 ... an). */
export async function uniqueSlug(input: string): Promise<string> {
  const start = slugify(input);
  let candidate = start;
  for (let n = 2; n < 100; n++) {
    const exists = await db
      .select({ id: staffProfiles.id })
      .from(staffProfiles)
      .where(eq(staffProfiles.slug, candidate))
      .limit(1);
    if (exists.length === 0) return candidate;
    candidate = `${start}-${n}`;
  }
  return `${start}-${Date.now()}`;
}

export async function listStaff() {
  return db
    .select({
      id: staffProfiles.id,
      userId: staffProfiles.userId,
      displayName: staffProfiles.displayName,
      slug: staffProfiles.slug,
      specialty: staffProfiles.specialty,
      isBookable: staffProfiles.isBookable,
      sortOrder: staffProfiles.sortOrder,
      email: users.email,
      isActive: users.isActive,
    })
    .from(staffProfiles)
    .innerJoin(users, eq(staffProfiles.userId, users.id))
    .orderBy(asc(staffProfiles.sortOrder), asc(staffProfiles.displayName));
}

export async function getStaffByUserId(userId: number): Promise<StaffProfile | null> {
  const rows = await db
    .select()
    .from(staffProfiles)
    .where(eq(staffProfiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getStaffById(id: number): Promise<StaffProfile | null> {
  const rows = await db.select().from(staffProfiles).where(eq(staffProfiles.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createStaffProfile(input: {
  userId: number;
  displayName: string;
  slug?: string;
  bio?: string | null;
  specialty?: string | null;
}): Promise<number> {
  const slug = await uniqueSlug(input.slug || input.displayName);
  const [{ id }] = await db
    .insert(staffProfiles)
    .values({
      userId: input.userId,
      displayName: input.displayName,
      slug,
      bio: input.bio ?? null,
      specialty: input.specialty ?? null,
    })
    .$returningId();
  return id;
}

export async function updateStaffProfile(
  id: number,
  values: {
    displayName?: string;
    bio?: string | null;
    specialty?: string | null;
    isBookable?: boolean;
  },
) {
  await db.update(staffProfiles).set(values).where(eq(staffProfiles.id, id));
}

export type BookableStaff = {
  id: number;
  displayName: string;
  slug: string;
  specialty: string | null;
  bio: string | null;
  avatarUrl: string | null;
  skillIds: number[];
  /** Stundensatz (CHF) pro skillId, als String (decimal). */
  rates: Record<number, string>;
};

/** Buchbare, aktive Mitarbeiter inkl. ihrer Skill-IDs (fuer den Wizard, client-seitig filterbar). */
export async function listBookableStaffWithSkills(): Promise<BookableStaff[]> {
  const staff = await db
    .select({
      id: staffProfiles.id,
      displayName: staffProfiles.displayName,
      slug: staffProfiles.slug,
      specialty: staffProfiles.specialty,
      bio: staffProfiles.bio,
      avatarUrl: staffProfiles.avatarUrl,
    })
    .from(staffProfiles)
    .innerJoin(users, eq(staffProfiles.userId, users.id))
    .where(and(eq(staffProfiles.isBookable, true), eq(users.isActive, true)))
    .orderBy(asc(staffProfiles.sortOrder), asc(staffProfiles.displayName));

  const links = await db
    .select({ staffId: staffSkills.staffId, skillId: staffSkills.skillId })
    .from(staffSkills);

  const bySkill = new Map<number, number[]>();
  for (const l of links) {
    const arr = bySkill.get(l.staffId) ?? [];
    arr.push(l.skillId);
    bySkill.set(l.staffId, arr);
  }

  const rateRows = await db
    .select({
      staffId: staffStyleRates.staffId,
      skillId: staffStyleRates.skillId,
      hourlyRate: staffStyleRates.hourlyRate,
    })
    .from(staffStyleRates);

  const ratesByStaff = new Map<number, Record<number, string>>();
  for (const r of rateRows) {
    const m = ratesByStaff.get(r.staffId) ?? {};
    m[r.skillId] = r.hourlyRate;
    ratesByStaff.set(r.staffId, m);
  }

  return staff.map((s) => ({
    ...s,
    skillIds: bySkill.get(s.id) ?? [],
    rates: ratesByStaff.get(s.id) ?? {},
  }));
}

