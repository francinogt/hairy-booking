import type { MetadataRoute } from "next";
import { getSettings } from "@/data/settings";
import { imageMimeFromPath, resolvePwaIconUrl } from "@/lib/branding-assets";

/**
 * Dynamisches Web-App-Manifest (ausgeliefert unter /manifest.webmanifest).
 *
 * Name, Farben und App-Icon stammen aus den Branding-Settings. Das Icon ist
 * das eigene PWA-Logo des Owners, sonst das Entwickler-Logo
 * (siehe lib/branding-assets.ts).
 *
 * `force-dynamic`, damit Aenderungen am Branding sofort greifen (das Manifest
 * wird zusaetzlich beim Speichern in app/actions/branding.ts revalidiert).
 */
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const iconUrl = resolvePwaIconUrl(s);
  const iconType = imageMimeFromPath(iconUrl);
  const isSvg = iconType === "image/svg+xml";

  // SVG ist skalierbar (sizes "any"); Rasterbilder geben wir mit den von
  // Browsern erwarteten Groessen 192/512 an (gleiche Quelle, wird skaliert).
  const icons: MetadataRoute.Manifest["icons"] = isSvg
    ? [{ src: iconUrl, sizes: "any", type: iconType, purpose: "any" }]
    : [
        { src: iconUrl, sizes: "192x192", type: iconType, purpose: "any" },
        { src: iconUrl, sizes: "512x512", type: iconType, purpose: "any" },
      ];

  return {
    name: s.companyName,
    short_name: s.shortName,
    description: `${s.companyName} – Termine online buchen`,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: s.pwaBackgroundColor,
    theme_color: s.pwaThemeColor,
    lang: s.locale,
    icons,
  };
}
