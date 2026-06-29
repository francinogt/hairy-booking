import "server-only";
import webpush from "web-push";
import { deletePushSubscription, listPushSubscriptions } from "@/data/pushSubscriptions";
import { DEVELOPER_LOGO_URL } from "@/lib/branding-assets";

/**
 * Web-Push-Versand (server-seitig) ueber die `web-push`-Library.
 *
 * VAPID-Schluessel kommen aus den Umgebungsvariablen (siehe .env.example).
 * Ist Push nicht konfiguriert, sind alle Funktionen No-Ops mit Warnung —
 * die App (Buchungen etc.) funktioniert dann ganz normal ohne Push.
 */

/** Nutzlast einer Push-Nachricht (wird im Service Worker ausgewertet). */
export type PushPayload = {
  title: string;
  body?: string;
  url?: string;
  icon?: string;
};

let configured: boolean | null = null;

/** Konfiguriert web-push einmalig mit den VAPID-Details. */
function ensureConfigured(): boolean {
  if (configured !== null) return configured;

  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    console.warn("[push] VAPID-Variablen fehlen — Push ist deaktiviert.");
    configured = false;
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

/**
 * Sendet eine Push-Nachricht an alle Geraete eines Nutzers.
 * Abgelaufene/ungueltige Abos (HTTP 404/410) werden automatisch entfernt.
 * Fehler werden geloggt, aber nie weitergeworfen (Best-Effort-Zustellung).
 */
export async function sendPushToUser(userId: number, payload: PushPayload): Promise<void> {
  if (!ensureConfigured()) return;

  const subs = await listPushSubscriptions(userId);
  if (subs.length === 0) return;

  const data = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
    url: payload.url ?? "/",
    icon: payload.icon ?? DEVELOPER_LOGO_URL,
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data,
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          // Abo ist beim Push-Dienst nicht mehr gueltig -> entfernen.
          await deletePushSubscription(sub.endpoint);
        } else {
          console.error("[push] Versand fehlgeschlagen:", err);
        }
      }
    }),
  );
}
