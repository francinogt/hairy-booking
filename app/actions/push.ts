"use server";

import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { deletePushSubscription, savePushSubscription } from "@/data/pushSubscriptions";

/**
 * Server-Actions fuer Web-Push-Abos.
 * Eingaben werden server-seitig mit Zod validiert (nie dem Client vertrauen).
 */

const subscriptionSchema = z.object({
  endpoint: z.string().url().max(512),
  keys: z.object({
    p256dh: z.string().min(1).max(255),
    auth: z.string().min(1).max(255),
  }),
});

export type PushActionState = { ok: boolean; error?: string };

/** Speichert das Push-Abo des aktuellen Nutzers. */
export async function subscribePush(subscriptionJson: unknown): Promise<PushActionState> {
  const user = await requireUser();

  const parsed = subscriptionSchema.safeParse(subscriptionJson);
  if (!parsed.success) {
    return { ok: false, error: "Ungueltige Abo-Daten." };
  }

  try {
    await savePushSubscription(user.id, {
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    });
    return { ok: true };
  } catch (err) {
    console.error("[push] Abo speichern fehlgeschlagen:", err);
    return { ok: false, error: "Abo konnte nicht gespeichert werden." };
  }
}

/** Entfernt das Push-Abo (Abmeldung) anhand des Endpoints. */
export async function unsubscribePush(endpoint: string): Promise<PushActionState> {
  await requireUser();

  const parsed = z.string().url().max(512).safeParse(endpoint);
  if (!parsed.success) return { ok: false, error: "Ungueltiger Endpoint." };

  try {
    await deletePushSubscription(parsed.data);
    return { ok: true };
  } catch (err) {
    console.error("[push] Abmelden fehlgeschlagen:", err);
    return { ok: false, error: "Abmeldung fehlgeschlagen." };
  }
}
