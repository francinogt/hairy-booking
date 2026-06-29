"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { uploadsDir } from "@/lib/uploads";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { BODY_VIEWS, USER_GENDERS } from "@/db/schema";
import { computeDayAvailability } from "@/data/slots";
import type { DayAvailability } from "@/lib/booking/types";
import { getSettings } from "@/data/settings";
import { getStaffById, listBookableStaffWithSkills } from "@/data/staff";
import { listSkillIdsForStaff } from "@/data/skills";
import { getStaffRates } from "@/data/rates";
import { createBookingRequest } from "@/data/bookingRequests";
import { createNotification } from "@/data/notifications";
import { estimateDurationMin, estimatePrice, roundUpToInterval } from "@/lib/booking/estimate";
import { isBodyPartKey } from "@/lib/booking/body-parts";

// --- Monats-Verfuegbarkeit (Kalender) ------------------------------------
const monthSchema = z.object({
  staffId: z.number().int().positive(),
  durationMin: z.number().int().positive().max(24 * 60),
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type MonthResult =
  | { ok: true; days: Record<string, DayAvailability> }
  | { ok: false; error: string };

export async function getMonthAvailability(input: {
  staffId: number;
  durationMin: number;
  fromDate: string;
  toDate: string;
}): Promise<MonthResult> {
  await requireUser();
  const parsed = monthSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ungültige Anfrage." };
  return { ok: true, days: await computeDayAvailability(parsed.data) };
}

// --- Anfrage absenden -----------------------------------------------------
const ALLOWED_IMAGE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

const submitSchema = z.object({
  styleId: z.number().int().positive(),
  staffId: z.number().int().positive(),
  genderUsed: z.enum(USER_GENDERS).nullable().optional(),
  bodyView: z.enum(BODY_VIEWS),
  coverage: z.record(z.string(), z.number()),
  placement: z.object({
    x: z.number(),
    y: z.number(),
    scaleX: z.number(),
    scaleY: z.number(),
    rotationDeg: z.number(),
    naturalWidth: z.number().positive(),
    naturalHeight: z.number().positive(),
  }),
  requestedStart: z
    .object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), time: z.string().regex(/^\d{2}:\d{2}$/) })
    .nullable(),
  customerNote: z.string().trim().max(2000).optional(),
  agbAccepted: z.boolean(),
});

export type SubmitResult = { ok: true; requestId: number } | { ok: false; error: string };

export async function submitBooking(formData: FormData): Promise<SubmitResult> {
  const user = await requireUser();

  let payload: unknown;
  try {
    payload = JSON.parse(String(formData.get("payload") ?? ""));
  } catch {
    return { ok: false, error: "Ungültige Anfragedaten." };
  }
  const parsed = submitSchema.safeParse(payload);
  if (!parsed.success) return { ok: false, error: "Bitte alle Schritte vollständig ausfüllen." };
  const data = parsed.data;
  if (!data.agbAccepted) return { ok: false, error: "Bitte akzeptiere die AGB." };

  // Mitarbeiter prüfen + Skill-Zuordnung serverseitig verifizieren
  const staff = await getStaffById(data.staffId);
  if (!staff || !staff.isBookable) return { ok: false, error: "Artist nicht verfügbar." };
  const staffSkillIds = await listSkillIdsForStaff(data.staffId);
  if (!staffSkillIds.includes(data.styleId)) {
    return { ok: false, error: "Dieser Artist bietet den gewählten Stil nicht an." };
  }

  const settings = await getSettings();

  // Bedeckung + Dauer/Preis serverseitig (Client-Werte nicht vertrauen)
  const coverage: Record<string, number> = {};
  for (const [k, v] of Object.entries(data.coverage)) {
    if (isBodyPartKey(k)) coverage[k] = Math.max(0, Math.min(1, v));
  }
  const durationMin = roundUpToInterval(estimateDurationMin(coverage), settings.slotIntervalMin);
  if (durationMin <= 0) return { ok: false, error: "Bitte platziere das Motiv auf der Figur." };

  const rates = await getStaffRates(data.staffId);
  const hourlyRate = Number(rates.find((r) => r.skillId === data.styleId)?.hourlyRate ?? 0);
  const price = estimatePrice(durationMin, hourlyRate, Number(settings.minPriceAmount));

  // Bild-Upload (Pflicht)
  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Bitte ein Motiv hochladen." };
  const ext = ALLOWED_IMAGE[file.type];
  if (!ext) return { ok: false, error: "Bildformat nicht unterstützt (PNG, JPG, WEBP)." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Bild ist zu gross (max. 8 MB)." };
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const filename = `ref-${user.id}-${file.size}-${file.name.replace(/[^a-zA-Z0-9.]/g, "").slice(-20)}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const requestedStartAt = data.requestedStart
    ? `${data.requestedStart.date} ${data.requestedStart.time}:00`
    : null;
  const agbAcceptedAt = toMysqlNow();

  const requestId = await createBookingRequest({
    customerId: user.id,
    staffId: data.staffId,
    skillId: data.styleId,
    genderUsed: data.genderUsed ?? null,
    bodyView: data.bodyView,
    estimatedDurationMin: durationMin,
    requestedStartAt,
    agbAcceptedAt,
    customerNote: data.customerNote || null,
    priceAmount: price.toFixed(2),
    images: [
      {
        imagePath: `/uploads/${filename}`,
        view: data.bodyView,
        x: data.placement.x,
        y: data.placement.y,
        scale: data.placement.scaleX,
        rotationDeg: data.placement.rotationDeg,
        naturalWidth: data.placement.naturalWidth,
        naturalHeight: data.placement.naturalHeight,
        coveredParts: Object.keys(coverage),
      },
    ],
  });

  await createNotification({
    recipientUserId: staff.userId,
    type: "booking_request_new",
    title: `Neue Anfrage von ${user.firstName} ${user.lastName}`,
    body: `ca. ${(durationMin / 60).toFixed(1)} Std${hourlyRate > 0 ? ` · ca. ${Math.round(price)} CHF` : ""}`,
    link: "/admin/requests",
  });

  // Hilfsfunktion ungenutzt vermeiden
  void listBookableStaffWithSkills;

  revalidatePath("/admin/requests");
  revalidatePath("/account");
  return { ok: true, requestId };
}

function toMysqlNow(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
