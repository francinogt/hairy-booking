import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { blockedTime, workingHours, type BlockedTime, type Weekday, type WorkingHour } from "@/db/schema";

export async function listWorkingHours(staffId: number): Promise<WorkingHour[]> {
  return db
    .select()
    .from(workingHours)
    .where(eq(workingHours.staffId, staffId))
    .orderBy(asc(workingHours.startTime));
}

/** Ersetzt die kompletten Arbeitszeiten eines Mitarbeiters (einfacher Wochen-Editor). */
export async function replaceWorkingHours(
  staffId: number,
  rows: { weekday: Weekday; startTime: string; endTime: string }[],
) {
  await db.transaction(async (tx) => {
    await tx.delete(workingHours).where(eq(workingHours.staffId, staffId));
    if (rows.length > 0) {
      await tx.insert(workingHours).values(
        rows.map((r) => ({
          staffId,
          weekday: r.weekday,
          startTime: r.startTime,
          endTime: r.endTime,
          isActive: true,
        })),
      );
    }
  });
}

export async function listBlockedTime(staffId: number): Promise<BlockedTime[]> {
  return db
    .select()
    .from(blockedTime)
    .where(eq(blockedTime.staffId, staffId))
    .orderBy(asc(blockedTime.startAt));
}

export async function addBlockedTime(input: {
  staffId: number;
  startAt: string;
  endAt: string;
  reason?: string | null;
}): Promise<number> {
  const [{ id }] = await db
    .insert(blockedTime)
    .values({
      staffId: input.staffId,
      startAt: input.startAt,
      endAt: input.endAt,
      reason: input.reason ?? null,
    })
    .$returningId();
  return id;
}

/** Loescht eine Sperrzeit nur, wenn sie dem angegebenen Mitarbeiter gehoert (IDOR-Schutz). */
export async function deleteBlockedTime(id: number, staffId: number) {
  await db.delete(blockedTime).where(and(eq(blockedTime.id, id), eq(blockedTime.staffId, staffId)));
}
