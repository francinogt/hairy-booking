import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { services, type Service } from "@/db/schema";

export async function listServicesByStaff(staffId: number): Promise<Service[]> {
  return db
    .select()
    .from(services)
    .where(eq(services.staffId, staffId))
    .orderBy(asc(services.name));
}

export async function getServiceById(id: number): Promise<Service | null> {
  const rows = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function createService(input: {
  staffId: number;
  name: string;
  description?: string | null;
  durationMin: number;
  priceAmount: string;
  bufferBeforeMin?: number;
  bufferAfterMin?: number;
  isActive?: boolean;
}): Promise<number> {
  const [{ id }] = await db
    .insert(services)
    .values({
      staffId: input.staffId,
      name: input.name,
      description: input.description ?? null,
      durationMin: input.durationMin,
      priceAmount: input.priceAmount,
      bufferBeforeMin: input.bufferBeforeMin ?? 0,
      bufferAfterMin: input.bufferAfterMin ?? 0,
      isActive: input.isActive ?? true,
    })
    .$returningId();
  return id;
}

export async function updateService(
  id: number,
  values: {
    name?: string;
    description?: string | null;
    durationMin?: number;
    priceAmount?: string;
    bufferBeforeMin?: number;
    bufferAfterMin?: number;
    isActive?: boolean;
  },
) {
  await db.update(services).set(values).where(eq(services.id, id));
}

export async function deleteService(id: number) {
  await db.delete(services).where(eq(services.id, id));
}
