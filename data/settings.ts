import "server-only";
import { cache } from "react";
import { db } from "@/db";
import { type Settings } from "@/db/schema";

/**
 * Fallback, damit die App auch ohne befuellte/erreichbare DB rendert
 * (z.B. vor dem ersten Seed). Werte spiegeln die Schema-Defaults.
 */
export const DEFAULT_SETTINGS: Settings = {
  id: 0,
  companyName: "Mein Studio",
  shortName: "Studio",
  industry: "tattoo",
  contactEmail: null,
  contactPhone: null,
  addressLine: null,
  postalCode: null,
  city: null,
  countryCode: "CH",
  timezone: "Europe/Zurich",
  locale: "de-CH",
  currency: "CHF",
  slotIntervalMin: 15,
  leadTimeMin: 60,
  bookingHorizonDays: 60,
  minPriceAmount: "0.00",
  logoPath: null,
  pwaLogoPath: null,
  colorNavbarBg: "#111827",
  colorNavbarText: "#ffffff",
  colorPageBg: "#ffffff",
  colorText: "#171717",
  colorAccent: "#2563eb",
  colorFooterBg: "#111827",
  colorFooterText: "#9ca3af",
  fontHeading: "geist",
  fontBody: "geist",
  pwaThemeColor: "#111827",
  pwaBackgroundColor: "#ffffff",
  brandingExtra: null,
  agbText: null,
  createdAt: "",
  updatedAt: "",
};

/**
 * Liest die Single-Row `settings`. Pro Render memoisiert (React cache).
 * Bei DB-Fehlern (nicht erreichbar / noch nicht migriert) -> Defaults,
 * damit die Oberflaeche nicht crasht.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const row = await db.query.settings.findFirst();
    return row ?? DEFAULT_SETTINGS;
  } catch (err) {
    console.warn(
      "[settings] DB nicht erreichbar – nutze Default-Branding:",
      err instanceof Error ? err.message : err,
    );
    return DEFAULT_SETTINGS;
  }
});
