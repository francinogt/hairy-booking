import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { pushSubscriptions, type PushSubscription } from "@/db/schema";

/**
 * Datenzugriff fuer Web-Push-Abonnements (Tabelle `push_subscriptions`).
 * Ein Nutzer kann mehrere Geraete/Browser haben -> mehrere Abos pro userId.
 */

export type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

/**
 * Legt ein Abo an bzw. aktualisiert es, falls der Endpoint bereits existiert
 * (Endpoint ist unique). So entstehen keine Duplikate, wenn ein Browser sich
 * erneut anmeldet.
 */
export async function savePushSubscription(
  userId: number,
  sub: PushSubscriptionInput,
): Promise<void> {
  await db
    .insert(pushSubscriptions)
    .values({ userId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth })
    .onDuplicateKeyUpdate({
      set: { userId, p256dh: sub.p256dh, auth: sub.auth },
    });
}

/** Entfernt ein Abo anhand des Endpoints (beim Abmelden / abgelaufenes Abo). */
export async function deletePushSubscription(endpoint: string): Promise<void> {
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
}

/** Alle Abos eines Nutzers (fuer den Versand an alle seine Geraete). */
export async function listPushSubscriptions(userId: number): Promise<PushSubscription[]> {
  return db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
}
