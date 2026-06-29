import "server-only";
import path from "node:path";

/**
 * Verzeichnis fuer hochgeladene Dateien (Logos, Referenzbilder).
 *
 * Default: `public/uploads` (funktioniert in `next dev`). Per `UPLOADS_DIR`
 * ueberschreibbar — auf Plesk empfiehlt sich ein PERSISTENTER Pfad ausserhalb
 * des Build-/Deploy-Verzeichnisses (z.B. `/var/www/vhosts/<domain>/uploads`),
 * damit Uploads ein Redeploy ueberleben. Schreiben (Server Actions) und Lesen
 * (Route Handler /uploads) nutzen beide diese Funktion → immer konsistent.
 */
export function uploadsDir(): string {
  const fromEnv = process.env.UPLOADS_DIR?.trim();
  if (fromEnv) return path.resolve(fromEnv);
  return path.join(process.cwd(), "public", "uploads");
}

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
};

/** MIME-Typ anhand der Dateiendung (Fallback: octet-stream). */
export function contentTypeForFilename(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}
