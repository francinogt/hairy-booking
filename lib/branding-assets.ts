import type { Settings } from "@/db/schema";

/**
 * Zentrale Konstanten und Helfer rund um Logos / PWA-Icons.
 *
 * Hier ist *eine* Quelle der Wahrheit fuer die Entwickler-Assets und die
 * Logik, welches Logo als App-Icon (PWA) verwendet wird. So muss die
 * Prioritaet nur an einer Stelle gepflegt werden.
 */

/** Anzeigename des Entwicklers (Footer-Credit). */
export const DEVELOPER_NAME = "Hairy Developer";

/** Entwickler-Logo (Hochformat) — Footer-Credit + PWA-Fallback-Icon. */
export const DEVELOPER_LOGO_URL = "/developer-logos/logo.png";

/** Breite Signatur-Variante des Entwickler-Logos (aktuell ungenutzt, fuer spaeter). */
export const DEVELOPER_SIGNATURE_URL = "/developer-logos/logo-signatur.png";

/**
 * Liefert das URL fuer das PWA-App-Icon.
 *
 * Prioritaet:
 *   1. Eigenes PWA-Logo des Owners (`pwaLogoPath`), falls hochgeladen
 *   2. Entwickler-Logo als Fallback
 *
 * Das normale Navbar-Logo (`logoPath`) wird bewusst NICHT verwendet, da es
 * meist ein breites Logo ist und sich schlecht als quadratisches Icon eignet.
 */
export function resolvePwaIconUrl(settings: Pick<Settings, "pwaLogoPath">): string {
  return settings.pwaLogoPath ?? DEVELOPER_LOGO_URL;
}

/** Ermittelt den MIME-Typ eines Bildpfads anhand der Dateiendung (fuer das Manifest). */
export function imageMimeFromPath(pathOrUrl: string): string {
  const ext = pathOrUrl.split(".").pop()?.toLowerCase() ?? "";
  switch (ext) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    case "svg":
      return "image/svg+xml";
    default:
      return "image/png";
  }
}
