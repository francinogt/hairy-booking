import "server-only";
import { and, eq, gt, inArray, isNotNull, lt } from "drizzle-orm";
import { db } from "@/db";
import {
  ACTIVE_APPOINTMENT_STATUSES,
  WEEKDAYS,
  appointments,
  blockedTime,
  bookingRequests,
  workingHours,
} from "@/db/schema";
import { fromMysqlDateTime, toMysqlDateTime } from "@/lib/datetime";
import { getSettings } from "@/data/settings";

type Interval = { start: number; end: number };

const MS_MIN = 60_000;
const MS_DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, "0");
const dateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const timeStr = (ms: number) => {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Aktuelle Zeit als naive Ortszeit (Komponenten in der Firmen-TZ), serverlokal geparst. */
function nowNaive(tz: string): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return new Date(`${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}`);
}

/**
 * Freie Start-Zeiten je Tag fuer einen Mitarbeiter und eine gewuenschte Dauer.
 * Rueckgabe: { 'YYYY-MM-DD': ['09:00','09:15', ...] }.
 * Belegt = aktive Termine + Sperrzeiten + offene Anfragen mit Wunschzeit (Soft-Hold).
 */
export async function computeFreeSlots(input: {
  staffId: number;
  durationMin: number;
  fromDate: string;
  toDate: string;
}): Promise<Record<string, string[]>> {
  if (input.durationMin <= 0) return {};
  const s = await getSettings();
  const interval = s.slotIntervalMin;
  const now = nowNaive(s.timezone);
  const earliest = now.getTime() + s.leadTimeMin * MS_MIN;
  const maxMs = now.getTime() + s.bookingHorizonDays * MS_DAY;

  const rangeStart = new Date(`${input.fromDate}T00:00:00`);
  let rangeEnd = new Date(`${input.toDate}T23:59:59`);
  if (rangeEnd.getTime() > maxMs) rangeEnd = new Date(maxMs);
  if (rangeEnd.getTime() < rangeStart.getTime()) return {};

  // Arbeitszeiten nach Wochentag
  const wh = await db
    .select()
    .from(workingHours)
    .where(and(eq(workingHours.staffId, input.staffId), eq(workingHours.isActive, true)));
  const byWeekday = new Map<string, { start: string; end: string }[]>();
  for (const w of wh) {
    const arr = byWeekday.get(w.weekday) ?? [];
    arr.push({ start: w.startTime, end: w.endTime });
    byWeekday.set(w.weekday, arr);
  }
  if (wh.length === 0) return {};

  // Belegte Intervalle im Bereich
  const startStr = toMysqlDateTime(rangeStart);
  const endStr = toMysqlDateTime(rangeEnd);
  const busy: Interval[] = [];

  const appts = await db
    .select({ startAt: appointments.startAt, endAt: appointments.endAt })
    .from(appointments)
    .where(
      and(
        eq(appointments.staffId, input.staffId),
        inArray(appointments.status, [...ACTIVE_APPOINTMENT_STATUSES]),
        lt(appointments.startAt, endStr),
        gt(appointments.endAt, startStr),
      ),
    );
  for (const a of appts) busy.push({ start: fromMysqlDateTime(a.startAt).getTime(), end: fromMysqlDateTime(a.endAt).getTime() });

  const blocks = await db
    .select({ startAt: blockedTime.startAt, endAt: blockedTime.endAt })
    .from(blockedTime)
    .where(
      and(
        eq(blockedTime.staffId, input.staffId),
        lt(blockedTime.startAt, endStr),
        gt(blockedTime.endAt, startStr),
      ),
    );
  for (const b of blocks) busy.push({ start: fromMysqlDateTime(b.startAt).getTime(), end: fromMysqlDateTime(b.endAt).getTime() });

  const holds = await db
    .select({ startAt: bookingRequests.requestedStartAt, dur: bookingRequests.estimatedDurationMin })
    .from(bookingRequests)
    .where(
      and(
        eq(bookingRequests.staffId, input.staffId),
        eq(bookingRequests.status, "pending"),
        isNotNull(bookingRequests.requestedStartAt),
      ),
    );
  for (const h of holds) {
    if (!h.startAt) continue;
    const st = fromMysqlDateTime(h.startAt).getTime();
    busy.push({ start: st, end: st + h.dur * MS_MIN });
  }

  const result: Record<string, string[]> = {};
  const durMs = input.durationMin * MS_MIN;
  const stepMs = interval * MS_MIN;

  for (let d = new Date(rangeStart); d.getTime() <= rangeEnd.getTime(); d.setDate(d.getDate() + 1)) {
    const weekday = WEEKDAYS[(d.getDay() + 6) % 7];
    const windows = byWeekday.get(weekday);
    if (!windows) continue;
    const dayMid = `${dateStr(d)}T00:00:00`;
    const dayStartMs = new Date(dayMid).getTime();
    const slots: string[] = [];
    for (const win of windows) {
      const [sh, sm] = win.start.split(":").map(Number);
      const [eh, em] = win.end.split(":").map(Number);
      const winEnd = dayStartMs + (eh * 60 + em) * MS_MIN;
      for (let t = dayStartMs + (sh * 60 + sm) * MS_MIN; t + durMs <= winEnd; t += stepMs) {
        if (t < earliest || t > maxMs) continue;
        const slotEnd = t + durMs;
        if (busy.some((b) => t < b.end && b.start < slotEnd)) continue;
        slots.push(timeStr(t));
      }
    }
    if (slots.length > 0) result[dateStr(d)] = slots;
  }

  return result;
}
