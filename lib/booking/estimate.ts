import { BODY_PART_FULL_MINUTES, type BodyPartKey } from "@/lib/booking/body-parts";

/** coverage: { bodyPartKey: Bedeckung 0..1 }. Liefert geschaetzte Minuten (proportional zur Flaeche). */
export function estimateDurationMin(coverage: Partial<Record<BodyPartKey, number>>): number {
  let minutes = 0;
  for (const key of Object.keys(coverage) as BodyPartKey[]) {
    const frac = Math.max(0, Math.min(1, coverage[key] ?? 0));
    minutes += frac * (BODY_PART_FULL_MINUTES[key] ?? 0);
  }
  return Math.round(minutes);
}

/** Preis = Stunden x Stundensatz, mindestens minPrice. */
export function estimatePrice(durationMin: number, hourlyRate: number, minPrice: number): number {
  const raw = (durationMin / 60) * hourlyRate;
  return Math.max(raw, minPrice);
}

/** Rundet Minuten auf das naechste Vielfache des Slot-Intervalls auf (fuer die Terminplanung). */
export function roundUpToInterval(minutes: number, interval: number): number {
  if (interval <= 0) return minutes;
  return Math.ceil(minutes / interval) * interval;
}
