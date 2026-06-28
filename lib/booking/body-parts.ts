export const BODY_PART_KEYS = [
  "head",
  "neck",
  "chest",
  "abdomen",
  "upper_back",
  "lower_back",
  "shoulder_left",
  "shoulder_right",
  "upper_arm_left",
  "upper_arm_right",
  "forearm_left",
  "forearm_right",
  "hand_left",
  "hand_right",
  "thigh_left",
  "thigh_right",
  "shin_left",
  "shin_right",
  "foot_left",
  "foot_right",
] as const;

export type BodyPartKey = (typeof BODY_PART_KEYS)[number];

export const BODY_PART_LABELS: Record<BodyPartKey, string> = {
  head: "Kopf",
  neck: "Hals",
  chest: "Brust",
  abdomen: "Bauch",
  upper_back: "Oberer Rücken",
  lower_back: "Unterer Rücken",
  shoulder_left: "Schulter links",
  shoulder_right: "Schulter rechts",
  upper_arm_left: "Oberarm links",
  upper_arm_right: "Oberarm rechts",
  forearm_left: "Unterarm links",
  forearm_right: "Unterarm rechts",
  hand_left: "Hand links",
  hand_right: "Hand rechts",
  thigh_left: "Oberschenkel links",
  thigh_right: "Oberschenkel rechts",
  shin_left: "Wade links",
  shin_right: "Wade rechts",
  foot_left: "Fuss links",
  foot_right: "Fuss rechts",
};

/**
 * Standard-Dauer (Minuten) fuer ein VOLLflaechiges Tattoo auf diesem Koerperteil.
 * Basiswerte fuer die Zeitschaetzung (Bedeckung x Voll-Dauer). Der Artist passt
 * den Endpreis/-zeit bei der Freigabe ohnehin an. Spaeter ggf. owner-konfigurierbar.
 */
export const BODY_PART_FULL_MINUTES: Record<BodyPartKey, number> = {
  head: 240,
  neck: 90,
  chest: 360,
  abdomen: 300,
  upper_back: 480,
  lower_back: 300,
  shoulder_left: 120,
  shoulder_right: 120,
  upper_arm_left: 300,
  upper_arm_right: 300,
  forearm_left: 240,
  forearm_right: 240,
  hand_left: 120,
  hand_right: 120,
  thigh_left: 360,
  thigh_right: 360,
  shin_left: 240,
  shin_right: 240,
  foot_left: 120,
  foot_right: 120,
};

export function isBodyPartKey(v: string): v is BodyPartKey {
  return (BODY_PART_KEYS as readonly string[]).includes(v);
}
