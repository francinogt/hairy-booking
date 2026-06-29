"use client";

import { useEffect } from "react";

/**
 * Registriert den Service Worker (/sw.js) im Browser.
 *
 * Voraussetzung dafuer, dass die App installierbar ist (PWA) und spaeter
 * Web-Push empfangen kann. Rendert nichts.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        // Fehler nur loggen — eine fehlende Registrierung darf die App nicht blockieren.
        console.error("Service-Worker-Registrierung fehlgeschlagen:", err);
      });
    };
    // Nach dem Load registrieren, um den initialen Seitenaufbau nicht zu verzoegern.
    if (document.readyState === "complete") register();
    else {
      window.addEventListener("load", register);
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
