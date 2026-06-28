import type { BodyPartKey } from "@/lib/booking/body-parts";

export type FigureKind = "male" | "female";
export type FigureView = "front" | "back";

export type FigurePart = {
  key: BodyPartKey;
  x: number;
  y: number;
  w: number;
  h: number;
  rounded?: number;
};

export type Figure = { width: number; height: number; parts: FigurePart[] };

// Schematische, segmentierte Mannequin-Geometrie (Koordinatenraum 300 x 620).
// Bewusst vereinfacht (Bloecke je Koerperregion) — fuer die Platzierung/Bedeckung
// voellig ausreichend; spaeter durch realistischere SVG-Pfade ersetzbar.
const ARMS_AND_LEGS: FigurePart[] = [
  { key: "shoulder_left", x: 86, y: 92, w: 28, h: 26, rounded: 12 },
  { key: "shoulder_right", x: 186, y: 92, w: 28, h: 26, rounded: 12 },
  { key: "upper_arm_left", x: 74, y: 112, w: 28, h: 92, rounded: 12 },
  { key: "upper_arm_right", x: 198, y: 112, w: 28, h: 92, rounded: 12 },
  { key: "forearm_left", x: 68, y: 204, w: 26, h: 92, rounded: 12 },
  { key: "forearm_right", x: 206, y: 204, w: 26, h: 92, rounded: 12 },
  { key: "hand_left", x: 62, y: 296, w: 26, h: 40, rounded: 10 },
  { key: "hand_right", x: 212, y: 296, w: 26, h: 40, rounded: 10 },
  { key: "thigh_left", x: 110, y: 252, w: 38, h: 126, rounded: 14 },
  { key: "thigh_right", x: 152, y: 252, w: 38, h: 126, rounded: 14 },
  { key: "shin_left", x: 114, y: 380, w: 32, h: 132, rounded: 12 },
  { key: "shin_right", x: 154, y: 380, w: 32, h: 132, rounded: 12 },
  { key: "foot_left", x: 108, y: 514, w: 40, h: 28, rounded: 8 },
  { key: "foot_right", x: 152, y: 514, w: 40, h: 28, rounded: 8 },
];

const FRONT_PARTS: FigurePart[] = [
  { key: "head", x: 125, y: 18, w: 50, h: 62, rounded: 24 },
  { key: "neck", x: 138, y: 78, w: 24, h: 18 },
  { key: "chest", x: 103, y: 96, w: 94, h: 74, rounded: 12 },
  { key: "abdomen", x: 108, y: 170, w: 84, h: 80, rounded: 12 },
  ...ARMS_AND_LEGS,
];

const BACK_PARTS: FigurePart[] = [
  { key: "head", x: 125, y: 18, w: 50, h: 62, rounded: 24 },
  { key: "neck", x: 138, y: 78, w: 24, h: 18 },
  { key: "upper_back", x: 103, y: 96, w: 94, h: 74, rounded: 12 },
  { key: "lower_back", x: 108, y: 170, w: 84, h: 80, rounded: 12 },
  ...ARMS_AND_LEGS,
];

const FRONT: Figure = { width: 300, height: 620, parts: FRONT_PARTS };
const BACK: Figure = { width: 300, height: 620, parts: BACK_PARTS };

// Maennlich/weiblich nutzen vorerst dieselbe schematische Geometrie.
export const FIGURES: Record<FigureKind, Record<FigureView, Figure>> = {
  male: { front: FRONT, back: BACK },
  female: { front: FRONT, back: BACK },
};

export const FIGURE_KIND_LABELS: Record<FigureKind, string> = {
  male: "Männlich",
  female: "Weiblich",
};
