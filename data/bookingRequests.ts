import "server-only";
import { and, desc, eq, gt, inArray, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  ACTIVE_APPOINTMENT_STATUSES,
  appointments,
  blockedTime,
  bookingRequestImages,
  bookingRequests,
  skills,
  staffProfiles,
  users,
  type BodyView,
  type UserGender,
} from "@/db/schema";

export type NewRequestImage = {
  imagePath: string;
  view: BodyView;
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
  naturalWidth: number;
  naturalHeight: number;
  coveredParts: string[];
};

/** Normalisierte Bildzeile: Dezimalstrings → number, json-Spalte → string[]. */
export type RequestImage = {
  requestId: number;
  imagePath: string;
  view: BodyView;
  x: number;
  y: number;
  scale: number;
  rotationDeg: number;
  naturalWidth: number;
  naturalHeight: number;
  coveredParts: string[];
};

/** Die json-Spalte kommt je nach Treiber als Array ODER als JSON-String zurueck. */
function parseCoveredParts(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function createBookingRequest(input: {
  customerId: number;
  staffId: number;
  skillId: number | null;
  genderUsed: UserGender | null;
  bodyView: BodyView;
  estimatedDurationMin: number;
  requestedStartAt: string | null;
  agbAcceptedAt: string;
  customerNote: string | null;
  priceAmount: string | null;
  images: NewRequestImage[];
}): Promise<number> {
  return db.transaction(async (tx) => {
    const [{ id }] = await tx
      .insert(bookingRequests)
      .values({
        customerId: input.customerId,
        staffId: input.staffId,
        skillId: input.skillId,
        genderUsed: input.genderUsed,
        bodyView: input.bodyView,
        estimatedDurationMin: input.estimatedDurationMin,
        requestedStartAt: input.requestedStartAt,
        agbAcceptedAt: input.agbAcceptedAt,
        customerNote: input.customerNote,
        priceAmount: input.priceAmount,
      })
      .$returningId();

    if (input.images.length > 0) {
      await tx.insert(bookingRequestImages).values(
        input.images.map((im) => ({
          requestId: id,
          imagePath: im.imagePath,
          view: im.view,
          x: im.x.toFixed(4),
          y: im.y.toFixed(4),
          scale: im.scale.toFixed(4),
          rotationDeg: Math.round(im.rotationDeg),
          naturalWidth: Math.round(im.naturalWidth),
          naturalHeight: Math.round(im.naturalHeight),
          coveredParts: im.coveredParts,
        })),
      );
    }
    return id;
  });
}

const REQUEST_FIELDS = {
  id: bookingRequests.id,
  status: bookingRequests.status,
  staffId: bookingRequests.staffId,
  customerId: bookingRequests.customerId,
  bodyView: bookingRequests.bodyView,
  genderUsed: bookingRequests.genderUsed,
  estimatedDurationMin: bookingRequests.estimatedDurationMin,
  requestedStartAt: bookingRequests.requestedStartAt,
  priceAmount: bookingRequests.priceAmount,
  priceCurrency: bookingRequests.priceCurrency,
  customerNote: bookingRequests.customerNote,
  staffNote: bookingRequests.staffNote,
  createdAt: bookingRequests.createdAt,
  customerFirst: users.firstName,
  customerLast: users.lastName,
  customerEmail: users.email,
  skillName: skills.name,
  staffDisplayName: staffProfiles.displayName,
  staffUserId: staffProfiles.userId,
} as const;

async function attachImages<T extends { id: number }>(reqs: T[]) {
  if (reqs.length === 0) return reqs.map((r) => ({ ...r, images: [] as RequestImage[] }));
  const ids = reqs.map((r) => r.id);
  const rows = await db
    .select()
    .from(bookingRequestImages)
    .where(inArray(bookingRequestImages.requestId, ids));
  const imgs: RequestImage[] = rows.map((im) => ({
    requestId: im.requestId,
    imagePath: im.imagePath,
    view: im.view,
    x: Number(im.x),
    y: Number(im.y),
    scale: Number(im.scale),
    rotationDeg: im.rotationDeg,
    naturalWidth: im.naturalWidth,
    naturalHeight: im.naturalHeight,
    coveredParts: parseCoveredParts(im.coveredParts),
  }));
  const byReq = new Map<number, RequestImage[]>();
  for (const im of imgs) {
    const arr = byReq.get(im.requestId) ?? [];
    arr.push(im);
    byReq.set(im.requestId, arr);
  }
  return reqs.map((r) => ({ ...r, images: byReq.get(r.id) ?? [] }));
}

export async function getBookingRequestById(id: number) {
  const rows = await db
    .select(REQUEST_FIELDS)
    .from(bookingRequests)
    .innerJoin(users, eq(bookingRequests.customerId, users.id))
    .innerJoin(staffProfiles, eq(bookingRequests.staffId, staffProfiles.id))
    .leftJoin(skills, eq(bookingRequests.skillId, skills.id))
    .where(eq(bookingRequests.id, id))
    .limit(1);
  if (!rows[0]) return null;
  const [withImgs] = await attachImages(rows);
  return withImgs;
}

export async function listPendingRequests(staffId?: number) {
  const where =
    staffId != null
      ? and(eq(bookingRequests.status, "pending"), eq(bookingRequests.staffId, staffId))
      : eq(bookingRequests.status, "pending");
  const reqs = await db
    .select(REQUEST_FIELDS)
    .from(bookingRequests)
    .innerJoin(users, eq(bookingRequests.customerId, users.id))
    .innerJoin(staffProfiles, eq(bookingRequests.staffId, staffProfiles.id))
    .leftJoin(skills, eq(bookingRequests.skillId, skills.id))
    .where(where)
    .orderBy(desc(bookingRequests.createdAt));
  return attachImages(reqs);
}

export async function listRequestsForCustomer(customerId: number) {
  const reqs = await db
    .select(REQUEST_FIELDS)
    .from(bookingRequests)
    .innerJoin(users, eq(bookingRequests.customerId, users.id))
    .innerJoin(staffProfiles, eq(bookingRequests.staffId, staffProfiles.id))
    .leftJoin(skills, eq(bookingRequests.skillId, skills.id))
    .where(eq(bookingRequests.customerId, customerId))
    .orderBy(desc(bookingRequests.createdAt));
  return attachImages(reqs);
}

export async function declineBookingRequest(
  requestId: number,
  staffNote: string | null,
): Promise<void> {
  await db
    .update(bookingRequests)
    .set({ status: "declined", staffNote })
    .where(eq(bookingRequests.id, requestId));
}

export type ConfirmResult =
  | { ok: true; appointmentId: number }
  | { ok: false; error: string };

/** Bestaetigt eine Anfrage: prueft den finalen Slot transaktional und legt den Termin an. */
export async function confirmBookingRequest(input: {
  requestId: number;
  staffId: number;
  customerId: number;
  customerNote: string | null;
  startAt: string;
  endAt: string;
  durationMin: number;
  priceAmount: string;
  staffNote: string | null;
}): Promise<ConfirmResult> {
  return db.transaction(async (tx) => {
    const apptOverlap = await tx
      .select({ id: appointments.id })
      .from(appointments)
      .where(
        and(
          eq(appointments.staffId, input.staffId),
          inArray(appointments.status, [...ACTIVE_APPOINTMENT_STATUSES]),
          lt(appointments.startAt, input.endAt),
          gt(appointments.endAt, input.startAt),
        ),
      )
      .limit(1);
    if (apptOverlap.length > 0) return { ok: false as const, error: "Dieser Zeitraum ist bereits belegt." };

    const blockOverlap = await tx
      .select({ id: blockedTime.id })
      .from(blockedTime)
      .where(
        and(
          eq(blockedTime.staffId, input.staffId),
          lt(blockedTime.startAt, input.endAt),
          gt(blockedTime.endAt, input.startAt),
        ),
      )
      .limit(1);
    if (blockOverlap.length > 0) return { ok: false as const, error: "Dieser Zeitraum ist gesperrt." };

    const [{ id: appointmentId }] = await tx
      .insert(appointments)
      .values({
        staffId: input.staffId,
        customerId: input.customerId,
        serviceId: null,
        requestId: input.requestId,
        startAt: input.startAt,
        endAt: input.endAt,
        status: "confirmed",
        priceAmount: input.priceAmount,
        customerNote: input.customerNote,
        staffNote: input.staffNote,
      })
      .$returningId();

    await tx
      .update(bookingRequests)
      .set({
        status: "confirmed",
        priceAmount: input.priceAmount,
        requestedStartAt: input.startAt,
        estimatedDurationMin: input.durationMin,
        staffNote: input.staffNote,
      })
      .where(eq(bookingRequests.id, input.requestId));

    return { ok: true as const, appointmentId };
  });
}
