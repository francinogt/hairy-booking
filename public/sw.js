// Minimaler Service Worker.
//
// Zweck:
//  1) Erfuellt die Installierbarkeits-Anforderung (Android/Chrome verlangt einen
//     registrierten Service Worker mit fetch-Handler fuer den Installations-Dialog).
//  2) Grundlage fuer spaetere Web-Push-Benachrichtigungen (push/notificationclick).
//
// Es wird bewusst KEIN Caching gemacht (keine Offline-Strategie), damit immer
// die aktuelle Version ausgeliefert wird.

self.addEventListener("install", () => {
  // Neue SW-Version sofort aktiv werden lassen.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through: Wir greifen nicht in Requests ein, der Browser laedt normal.
// Der reine Vorhandensein dieses Handlers ist fuer die Installierbarkeit noetig.
self.addEventListener("fetch", () => {});

// --- Web-Push ---------------------------------------------------------------

// Eingehende Push-Nachricht anzeigen. Nutzlast siehe lib/push/server.ts.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = {};
  }
  const title = data.title || "Benachrichtigung";
  const options = {
    body: data.body || "",
    icon: data.icon || "/developer-logos/logo.png",
    badge: data.icon || "/developer-logos/logo.png",
    data: { url: data.url || "/" },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Klick auf die Benachrichtigung -> bestehendes Fenster fokussieren oder oeffnen.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) return client.focus();
        }
        if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
        return undefined;
      }),
  );
});
