# Erledigte Tasks

## 2026-06-29 — Web-Push-Benachrichtigungen (Schritt 2)
- `web-push` installiert, als `serverExternalPackages` markiert
- VAPID-Keys generiert, in `.env` gesetzt + `.env.example` dokumentiert
- Datenzugriff `data/pushSubscriptions.ts` (Abo speichern/loeschen/auflisten)
- Versand-Logik `lib/push/server.ts` (Best-Effort, raeumt abgelaufene Abos auf)
- Server-Actions `app/actions/push.ts` (an-/abmelden, Zod-validiert)
- Opt-in-Button `components/push-toggle.tsx` (inkl. iOS-Hinweis) — eingebunden in
  Konto-Seite und Verwaltung → Benachrichtigungen
- Service Worker um `push`/`notificationclick` erweitert
- `createNotification` sendet zusaetzlich Web-Push
- Lokaler Build gruen (`next build`)

## 2026-06-29 — PWA installierbar machen + Entwickler-Logo
- Entwickler-Logos nach `public/developer-logos/` verschoben (URL ohne Leerzeichen)
- Footer: `logo.png` + «Entwickelt von Hairy Developer» dauerhaft angezeigt
- DB: Spalte `pwa_logo_path` in `settings` + Migration `0005_lowly_molecule_man.sql`
- Branding-Admin: separates Upload-Feld «PWA-Logo» (Upload in Hilfsfunktion ausgelagert)
- `app/manifest.ts` neu: Name/Farben aus Settings, Icon = PWA-Logo ?? Entwickler-Logo
- Service Worker (`public/sw.js`) + Registrierung (`components/pwa-register.tsx`)
- Apple-Touch-Icon im Layout gesetzt
- Zentrale Logik in `lib/branding-assets.ts`
- Lokaler Build gruen (`next build`), Doku im README ergaenzt
