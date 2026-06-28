import type { Settings } from "@/db/schema";

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

        <p className="mt-6 border-t border-white/10 pt-4 text-xs opacity-60">
          © {year} {settings.companyName}. Alle Rechte vorbehalten.
        </p>
      </div>
    </footer>
  );
}
