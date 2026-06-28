"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaffAccess } from "@/lib/auth/dal";
import {
  confirmBookingRequest,
  declineBookingRequest,
  getBookingRequestById,
} from "@/data/bookingRequests";
import { createNotification } from "@/data/notifications";
import { fromMysqlDateTime, toMysqlDateTime } from "@/lib/datetime";

export type DecisionState = { error?: string; success?: boolean } | undefined;

const confirmSchema = z.object({
  requestId: z.coerce.number().int().positive(),
  priceAmount: z.coerce.number().min(0).max(99_999_999),
  durationMin: z.coerce.number().int().min(5).max(24 * 60),
  startAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  staffNote: z.string().trim().max(2000).optional(),
});

export async function confirmRequest(_prev: DecisionState, formData: FormData): Promise<DecisionState> {
  const parsed = confirmSchema.safeParse({
    requestId: formData.get("requestId"),
    priceAmount: formData.get("priceAmount"),
    durationMin: formData.get("durationMin"),
    startAt: formData.get("startAt"),
    staffNote: formData.get("staffNote") || undefined,
  });
  if (!parsed.success) return { error: "Bitte Preis, Dauer und Startzeit prüfen." };

  const req = await getBookingRequestById(parsed.data.requestId);
  if (!req) return { error: "Anfrage nicht gefunden." };
  if (req.status !== "pending") return { error: "Anfrage ist nicht mehr offen." };
  await requireStaffAccess(req.staffId); // Owner ok; Mitarbeiter nur eigene

  const startAt = `${parsed.data.startAt.replace("T", " ")}:00`;
  const endAt = toMysqlDateTime(
    new Date(fromMysqlDateTime(startAt).getTime() + parsed.data.durationMin * 60_000),
  );

  const result = await confirmBookingRequest({
    requestId: req.id,
    staffId: req.staffId,
    customerId: req.customerId,
    customerNote: req.customerNote,
    startAt,
    endAt,
    durationMin: parsed.data.durationMin,
    priceAmount: parsed.data.priceAmount.toFixed(2),
    staffNote: parsed.data.staffNote || null,
  });
  if (!result.ok) return { error: result.error };

  await createNotification({
    recipientUserId: req.customerId,
    type: "booking_request_confirmed",
    title: "Dein Termin wurde bestätigt",
    body: `${startAt.slice(0, 16)} Uhr · ${parsed.data.priceAmount.toFixed(2)} CHF`,
    link: "/account",
  });

  revalidatePath("/admin/requests");
  revalidatePath("/account");
  return { success: true };
}

export async function declineRequest(formData: FormData): Promise<void> {
  const requestId = Number(formData.get("requestId"));
  if (!Number.isFinite(requestId)) return;
  const req = await getBookingRequestById(requestId);
  if (!req || req.status !== "pending") return;
  await requireStaffAccess(req.staffId);

  const staffNote = String(formData.get("staffNote") ?? "").trim() || null;
  await declineBookingRequest(requestId, staffNote);

  await createNotification({
    recipientUserId: req.customerId,
    type: "booking_request_declined",
    title: "Anfrage abgelehnt",
    body: staffNote,
    link: "/account",
  });

  revalidatePath("/admin/requests");
  revalidatePath("/account");
}
