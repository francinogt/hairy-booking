"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { isFontKey } from "@/lib/font-options";

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
    ...colors,
  };

  // Optionaler Logo-Upload (Single-Tenant, lokaler Node-Server -> FS schreibbar)
  const file = formData.get("logo");
  if (file instanceof File && file.size > 0) {
    const ext = ALLOWED_IMAGE[file.type];
    if (!ext) return { error: "Logo-Format nicht unterstuetzt (PNG, JPG, WEBP, SVG)." };
    if (file.size > MAX_LOGO_BYTES) return { error: "Logo ist zu gross (max. 2 MB)." };
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const filename = `logo-${Date.now()}.${ext}`;
    await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
    values.logoPath = `/uploads/${filename}`;
  }

  await updateSettingsRow(values);

  // Layout (Branding-Variablen) + Manifest (PWA-Icons/Farben) neu validieren.
  revalidatePath("/", "layout");
  revalidatePath("/manifest.webmanifest");
  return { success: true };
}
