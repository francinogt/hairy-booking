"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { isFontKey } from "@/lib/font-options";
import { uploadsDir } from "@/lib/uploads";

const HEX = /^#[0-9a-fA-F]{6}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COLOR_FIELDS = [
  "colorNavbarBg",
  "colorNavbarText",
  "colorPageBg",
  "colorText",
  "colorAccent",
  "colorFooterBg",
  "colorFooterText",
  "pwaThemeColor",
  "pwaBackgroundColor",
] as const;
const ALLOWED_IMAGE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const MAX_LOGO_BYTES = 2 * 1024 * 1024;

export type BrandingState = { error?: string; success?: boolean } | undefined;

/**
 * Speichert ein hochgeladenes Bild unter public/uploads und liefert den
 * oeffentlichen Pfad zurueck. `null` -> kein (gueltiges) File vorhanden.
 * Wirft bei ungueltigem Format/zu grosser Datei einen Error mit Meldung.
 */
async function saveUploadedImage(file: FormDataEntryValue | null, prefix: string): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = ALLOWED_IMAGE[file.type];
  if (!ext) throw new Error("Bild-Format nicht unterstuetzt (PNG, JPG, WEBP, SVG).");
  if (file.size > MAX_LOGO_BYTES) throw new Error("Bild ist zu gross (max. 2 MB).");
  const dir = uploadsDir();
  await mkdir(dir, { recursive: true });
  const filename = `${prefix}-${Date.now()}.${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${filename}`;
}

async function updateSettingsRow(values: Partial<typeof settings.$inferInsert>) {
  const existing = await db.select({ id: settings.id }).from(settings).limit(1);
  const id = existing[0]?.id;
  if (id) {
    await db.update(settings).set(values).where(eq(settings.id, id));
  } else {
    await db.insert(settings).values(values);
  }
}

export async function saveBranding(
  _prev: BrandingState,
  formData: FormData,
): Promise<BrandingState> {
  await requireOwner();

  const companyName = String(formData.get("companyName") ?? "").trim();
  if (!companyName) return { error: "Firmenname ist erforderlich." };

  const shortNameRaw = String(formData.get("shortName") ?? "").trim();
  const industry = String(formData.get("industry") ?? "").trim() || "tattoo";

  const colors: Partial<Record<(typeof COLOR_FIELDS)[number], string>> = {};
  for (const field of COLOR_FIELDS) {
    const value = String(formData.get(field) ?? "").trim().toLowerCase();
    if (!HEX.test(value)) {
      return { error: `Ungueltiger Farbwert (${field}). Bitte Format #RRGGBB verwenden.` };
    }
    colors[field] = value;
  }

  const fontHeading = String(formData.get("fontHeading") ?? "geist");
  const fontBody = String(formData.get("fontBody") ?? "geist");
  if (!isFontKey(fontHeading) || !isFontKey(fontBody)) {
    return { error: "Unbekannte Schriftart." };
  }

  const contactEmail = String(formData.get("contactEmail") ?? "").trim() || null;
  if (contactEmail && !EMAIL.test(contactEmail)) {
    return { error: "Ungueltige Kontakt-E-Mail-Adresse." };
  }
  const contactPhone = String(formData.get("contactPhone") ?? "").trim() || null;
  const addressLine = String(formData.get("addressLine") ?? "").trim() || null;
  const postalCode = String(formData.get("postalCode") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;

  const minPriceRaw = String(formData.get("minPriceAmount") ?? "").trim().replace(",", ".");
  let minPriceAmount: string | undefined;
  if (minPriceRaw !== "") {
    const n = Number(minPriceRaw);
    if (!Number.isFinite(n) || n < 0) return { error: "Ungültiger Mindestpreis." };
    minPriceAmount = n.toFixed(2);
  }

  const values: Partial<typeof settings.$inferInsert> = {
    companyName,
    shortName: (shortNameRaw || companyName).slice(0, 24),
    industry,
    fontHeading,
    fontBody,
    contactEmail,
    contactPhone,
    addressLine,
    postalCode,
    city,
    ...(minPriceAmount !== undefined ? { minPriceAmount } : {}),
    ...colors,
  };

  // Optionale Logo-Uploads (Single-Tenant, lokaler Node-Server -> FS schreibbar)
  try {
    const logoPath = await saveUploadedImage(formData.get("logo"), "logo");
    if (logoPath) values.logoPath = logoPath;
    const pwaLogoPath = await saveUploadedImage(formData.get("pwaLogo"), "pwa-logo");
    if (pwaLogoPath) values.pwaLogoPath = pwaLogoPath;
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Upload fehlgeschlagen." };
  }

  await updateSettingsRow(values);

  // Layout (Branding-Variablen) + Manifest (PWA-Icons/Farben) neu validieren.
  revalidatePath("/", "layout");
  revalidatePath("/manifest.webmanifest");
  return { success: true };
}
