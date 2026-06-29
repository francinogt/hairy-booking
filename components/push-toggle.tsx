"use client";

import { useEffect, useState } from "react";
import { subscribePush, unsubscribePush } from "@/app/actions/push";

/**
 * Opt-in-Schalter fuer Web-Push-Benachrichtigungen.
 *
 * Ablauf beim Aktivieren: Permission anfragen -> beim Push-Dienst abonnieren
 * (pushManager.subscribe) -> Abo per Server-Action in der DB speichern.
 *
 * Voraussetzung: registrierter Service Worker (siehe components/pwa-register.tsx)
 * und gesetzter NEXT_PUBLIC_VAPID_PUBLIC_KEY.
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/** Wandelt einen base64url-VAPID-Key in das von pushManager erwartete Uint8Array. */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

type Status = "loading" | "unsupported" | "unconfigured" | "denied" | "idle" | "subscribed";

const btn =
  "rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-60";

export function PushToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // iOS erlaubt Push nur, wenn die App zum Home-Bildschirm hinzugefuegt wurde.
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    if (!supported) {
      setStatus("unsupported");
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      setStatus("unconfigured");
      return;
    }

    // iOS-Hinweis: Safari auf iPhone, aber (noch) nicht als installierte PWA.
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setIosHint(isIos && !isStandalone);

    if (Notification.permission === "denied") {
      setStatus("denied");
      return;
    }

    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "subscribed" : "idle"))
      .catch(() => setStatus("idle"));
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      const result = await subscribePush(sub.toJSON());
      if (!result.ok) {
        setError(result.error ?? "Aktivierung fehlgeschlagen.");
        return;
      }
      setStatus("subscribed");
    } catch (err) {
      console.error("[push] Aktivieren fehlgeschlagen:", err);
      setError("Aktivierung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await unsubscribePush(sub.endpoint);
      }
      setStatus("idle");
    } catch (err) {
      console.error("[push] Deaktivieren fehlgeschlagen:", err);
      setError("Deaktivierung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") {
    return <p className="text-sm text-zinc-400">Benachrichtigungen werden geprüft …</p>;
  }
  if (status === "unsupported") {
    return (
      <p className="text-sm text-zinc-500">
        Dieser Browser unterstützt keine Push-Benachrichtigungen.
      </p>
    );
  }
  if (status === "unconfigured") {
    return (
      <p className="text-sm text-zinc-500">
        Push ist auf dem Server nicht konfiguriert (VAPID-Schlüssel fehlen).
      </p>
    );
  }
  if (status === "denied") {
    return (
      <p className="text-sm text-zinc-500">
        Benachrichtigungen sind im Browser blockiert. Bitte in den Website-Einstellungen erlauben.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {status === "subscribed" ? (
        <button type="button" onClick={disable} disabled={busy} className={btn}>
          {busy ? "…" : "Benachrichtigungen deaktivieren"}
        </button>
      ) : (
        <button type="button" onClick={enable} disabled={busy} className={btn}>
          {busy ? "…" : "Benachrichtigungen aktivieren"}
        </button>
      )}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {iosHint ? (
        <p className="text-xs text-zinc-400">
          Tipp für iPhone/iPad: Füge die App zuerst über «Teilen → Zum Home-Bildschirm» hinzu,
          damit Benachrichtigungen funktionieren (ab iOS 16.4).
        </p>
      ) : null}
    </div>
  );
}
