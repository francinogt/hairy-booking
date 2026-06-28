import type { FigurePart } from "@/lib/booking/figures";
import type { BodyPartKey } from "@/lib/booking/body-parts";

export type Point = { x: number; y: number };

/** Punkt-in-konvexem-Viereck (Eckpunkte im Uhrzeigersinn oder gegen den UZS). */
function pointInQuad(p: Point, quad: Point[]): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = quad[i];
    const b = quad[(i + 1) % 4];
    const cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x);
    if (cross !== 0) {
      const s = cross > 0 ? 1 : -1;
      if (sign === 0) sign = s;
      else if (s !== sign) return false;
    }
  }
  return true;
}

/**
 * Schaetzt pro Koerperteil, welcher Flaechenanteil (0..1) vom (transformierten) Bild
 * bedeckt wird — per Punktraster-Sampling. `quad` = die 4 Eckpunkte des Bildes im
 * Figuren-Koordinatenraum.
 */
export function computeCoverage(
  quad: Point[],
  parts: FigurePart[],
  samples = 7,
): Partial<Record<BodyPartKey, number>> {
  const result: Partial<Record<BodyPartKey, number>> = {};
  const total = samples * samples;
  for (const part of parts) {
    let inside = 0;
    for (let i = 0; i < samples; i++) {
      for (let j = 0; j < samples; j++) {
        const px = part.x + ((i + 0.5) / samples) * part.w;
        const py = part.y + ((j + 0.5) / samples) * part.h;
        if (pointInQuad({ x: px, y: py }, quad)) inside++;
      }
    }
    const frac = inside / total;
    if (frac > 0.02) result[part.key] = Math.round(frac * 100) / 100;
  }
  return result;
}
