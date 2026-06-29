# Erledigte Tasks

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
