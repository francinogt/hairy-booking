// Reine Font-Metadaten OHNE Import von `next/font` -> sicher in Client Components nutzbar
// (z.B. die Branding-Auswahl). Die eigentlichen Font-Loader leben in lib/fonts.ts.

export const FONT_OPTIONS = [
  { key: "geist", label: "Geist (Standard)" },
  { key: "inter", label: "Inter" },
  { key: "poppins", label: "Poppins" },
  { key: "montserrat", label: "Montserrat" },
  { key: "lora", label: "Lora (Serif)" },
] as const;

export type FontKey = (typeof FONT_OPTIONS)[number]["key"];

export const FONT_KEYS = FONT_OPTIONS.map((o) => o.key) as FontKey[];

export function isFontKey(value: string): value is FontKey {
  return FONT_KEYS.includes(value as FontKey);
}
