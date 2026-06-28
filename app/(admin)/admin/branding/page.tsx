import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth/dal";
import { getSettings } from "@/data/settings";
import { BrandingForm } from "@/components/admin/branding-form";

export const metadata: Metadata = {
  title: "Branding",
};

export default async function BrandingPage() {
  await requireOwner();
  const s = await getSettings();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold text-zinc-900">Branding &amp; Firma</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Logo, Farben und Schriftarten deiner Instanz. Änderungen werden sofort übernommen.
      </p>

      <div className="mt-8">
        <BrandingForm
          initial={{
            companyName: s.companyName,
            shortName: s.shortName,
            industry: s.industry,
            contactEmail: s.contactEmail ?? "",
            contactPhone: s.contactPhone ?? "",
            addressLine: s.addressLine ?? "",
            postalCode: s.postalCode ?? "",
            city: s.city ?? "",
            colorNavbarBg: s.colorNavbarBg,
            colorNavbarText: s.colorNavbarText,
            colorPageBg: s.colorPageBg,
            colorText: s.colorText,
            colorAccent: s.colorAccent,
            colorFooterBg: s.colorFooterBg,
            colorFooterText: s.colorFooterText,
            pwaThemeColor: s.pwaThemeColor,
            pwaBackgroundColor: s.pwaBackgroundColor,
            fontHeading: s.fontHeading,
            fontBody: s.fontBody,
            logoPath: s.logoPath,
          }}
        />
      </div>
    </main>
  );
}
