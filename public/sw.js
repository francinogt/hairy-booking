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
