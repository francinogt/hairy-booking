import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffStyleRates } from "@/db/schema";

export async function getStaffRates(
  staffId: number,
): Promise<{ skillId: number; hourlyRate: string }[]> {
  return db
    .select({ skillId: staffStyleRates.skillId, hourlyRate: staffStyleRates.hourlyRate })
    .from(staffStyleRates)
    .where(eq(staffStyleRates.staffId, staffId));
}

/** Ersetzt alle Stundensaetze eines Mitarbeiters (tx). */
export async function replaceStaffRates(
  staffId: number,
  entries: { skillId: number; hourlyRate: string }[],
) {
  await db.transaction(async (tx) => {
    await tx.delete(staffStyleRates).where(eq(staffStyleRates.staffId, staffId));
    if (entries.length > 0) {
      await tx.insert(staffStyleRates).values(
        entries.map((e) => ({ staffId, skillId: e.skillId, hourlyRate: e.hourlyRate })),
      );
    }
  });
}
