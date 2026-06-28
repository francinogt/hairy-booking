import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSettings } from "@/data/settings";
import { getCurrentUser } from "@/lib/auth/dal";
import { baseFontClasses, fontCssVars } from "@/lib/fonts";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: s.companyName, template: `%s · ${s.companyName}` },
    description: `${s.companyName} – Termine online buchen`,
    applicationName: s.companyName,
  };
}

export async function generateViewport(): Promise<Viewport> {
  const s = await getSettings();
  return {
    themeColor: s.pwaThemeColor,
    width: "device-width",
    initialScale: 1,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [s, user] = await Promise.all([getSettings(), getCurrentUser()]);

  // Branding aus der DB als CSS-Variablen. Farbwerte werden beim Speichern
  // gegen ^#[0-9a-fA-F]{6}$ validiert (Schutz gegen CSS/HTML-Injection).
  const brandCss =
    `:root{` +
    `--navbar-bg:${s.colorNavbarBg};` +
    `--navbar-text:${s.colorNavbarText};` +
    `--background:${s.colorPageBg};` +
    `--foreground:${s.colorText};` +
    `--accent:${s.colorAccent};` +
    `--footer-bg:${s.colorFooterBg};` +
    `--footer-text:${s.colorFooterText};` +
    fontCssVars(s.fontHeading, s.fontBody) +
    `}`;

  return (
    <html lang="de-CH" className={`${baseFontClasses} h-full antialiased`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: brandCss }} />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Navbar user={user} settings={s} />
        {children}
        <Footer settings={s} />
      </body>
    </html>
  );
}
