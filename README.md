This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## PWA & Branding

Die App ist als PWA installierbar (Home-Bildschirm auf iOS/Android).

- **Manifest:** dynamisch unter `/manifest.webmanifest` ([app/manifest.ts](app/manifest.ts)) — Name, Farben und Icon stammen aus den Branding-Settings.
- **App-Icon (Prioritaet):** eigenes PWA-Logo des Owners (Branding-Seite, Feld «PWA-Logo») → sonst Entwickler-Logo. Logik zentral in [lib/branding-assets.ts](lib/branding-assets.ts).
- **Service Worker:** [public/sw.js](public/sw.js), registriert via [components/pwa-register.tsx](components/pwa-register.tsx). Noetig fuer die Installierbarkeit (Android) und spaeteren Web-Push.
- **Entwickler-Logo:** liegt unter `public/developer-logos/` und wird im Footer als «Entwickelt von Hairy Developer» angezeigt.

> Hinweis iOS: Web-Push funktioniert erst ab iOS 16.4 und nur, wenn die App vorher zum Home-Bildschirm hinzugefuegt wurde.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
