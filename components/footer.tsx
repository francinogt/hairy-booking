import type { Settings } from "@/db/schema";
import { DEVELOPER_LOGO_URL, DEVELOPER_NAME } from "@/lib/branding-assets";

export function Footer({ settings }: { settings: Settings }) {
  const year = new Date().getFullYear();
  const cityLine = [settings.postalCode, settings.city].filter(Boolean).join(" ");
  const addressParts = [settings.addressLine, cityLine].filter(Boolean);

  return (
    <footer className="mt-auto bg-footer text-footer-foreground">
      <div className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-heading text-base font-semibold">{settings.companyName}</p>
            {addressParts.length > 0 ? (
              <p className="mt-1 text-sm opacity-80">{addressParts.join(", ")}</p>
            ) : null}
          </div>

          {settings.contactEmail || settings.contactPhone ? (
            <div className="flex flex-col gap-1 text-sm opacity-80">
              {settings.contactEmail ? (
                <a href={`mailto:${settings.contactEmail}`} className="hover:opacity-100">
                  {settings.contactEmail}
                </a>
              ) : null}
              {settings.contactPhone ? (
                <a href={`tel:${settings.contactPhone}`} className="hover:opacity-100">
                  {settings.contactPhone}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/10 pt-4 text-xs opacity-60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {settings.companyName}. Alle Rechte vorbehalten.</p>
          <span className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- statisches Entwickler-Logo */}
            <img src={DEVELOPER_LOGO_URL} alt={DEVELOPER_NAME} className="h-8 w-auto" />
            <span>Entwickelt von {DEVELOPER_NAME}</span>
          </span>
        </div>
      </div>
    </footer>
  );
}
