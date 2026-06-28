"use client";

import { useActionState, useState } from "react";
import { saveBranding, type BrandingState } from "@/app/actions/branding";
import { FONT_OPTIONS } from "@/lib/font-options";

export type BrandingInitial = {
  companyName: string;
  shortName: string;
  industry: string;
  minPriceAmount: string;
  contactEmail: string;
  contactPhone: string;
  addressLine: string;
  postalCode: string;
  city: string;
  colorNavbarBg: string;
  colorNavbarText: string;
  colorPageBg: string;
  colorText: string;
  colorAccent: string;
  colorFooterBg: string;
  colorFooterText: string;
  pwaThemeColor: string;
  pwaBackgroundColor: string;
  fontHeading: string;
  fontBody: string;
  logoPath: string | null;
};

const textInput =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 " +
  "outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10";

function ColorField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm font-medium text-zinc-700">
      <span>{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-zinc-300"
        />
        <code className="w-20 text-xs text-zinc-500">{value}</code>
      </span>
    </label>
  );
}

export function BrandingForm({ initial }: { initial: BrandingInitial }) {
  const [state, action, pending] = useActionState<BrandingState, FormData>(saveBranding, undefined);

  const [navbarBg, setNavbarBg] = useState(initial.colorNavbarBg);
  const [navbarText, setNavbarText] = useState(initial.colorNavbarText);
  const [pageBg, setPageBg] = useState(initial.colorPageBg);
  const [text, setText] = useState(initial.colorText);
  const [accent, setAccent] = useState(initial.colorAccent);
  const [footerBg, setFooterBg] = useState(initial.colorFooterBg);
  const [footerText, setFooterText] = useState(initial.colorFooterText);
  const [pwaTheme, setPwaTheme] = useState(initial.pwaThemeColor);
  const [pwaBg, setPwaBg] = useState(initial.pwaBackgroundColor);

  return (
    <form action={action} className="flex flex-col gap-8">
      {state?.error ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      {state?.success ? (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          Branding gespeichert.
        </p>
      ) : null}

      {/* Firma */}
      <fieldset className="flex flex-col gap-4">
        <legend className="font-heading text-lg font-semibold text-zinc-900">Firma</legend>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Firmenname
          <input name="companyName" defaultValue={initial.companyName} required className={textInput} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Kurzname (PWA, max. 24)
            <input name="shortName" defaultValue={initial.shortName} maxLength={24} className={textInput} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Branche
            <input name="industry" defaultValue={initial.industry} list="industries" className={textInput} />
            <datalist id="industries">
              <option value="tattoo" />
              <option value="coiffeur" />
              <option value="kosmetik" />
              <option value="massage" />
              <option value="nagelstudio" />
            </datalist>
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700 sm:max-w-xs">
          Mindestpreis (CHF) <span className="font-normal text-zinc-400">(gilt für alle Tattoos)</span>
          <input
            type="number"
            name="minPriceAmount"
            min={0}
            step="5"
            defaultValue={initial.minPriceAmount}
            className={textInput}
          />
        </label>
      </fieldset>

      {/* Kontakt & Adresse (erscheint im Footer) */}
      <fieldset className="flex flex-col gap-4">
        <legend className="font-heading text-lg font-semibold text-zinc-900">Kontakt &amp; Adresse</legend>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Kontakt-E-Mail
            <input type="email" name="contactEmail" defaultValue={initial.contactEmail} className={textInput} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Telefon
            <input type="tel" name="contactPhone" defaultValue={initial.contactPhone} className={textInput} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Strasse / Adresse
          <input type="text" name="addressLine" defaultValue={initial.addressLine} className={textInput} />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            PLZ
            <input type="text" name="postalCode" defaultValue={initial.postalCode} className={textInput} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
            Ort
            <input type="text" name="city" defaultValue={initial.city} className={textInput} />
          </label>
        </div>
      </fieldset>

      {/* Logo */}
      <fieldset className="flex flex-col gap-3">
        <legend className="font-heading text-lg font-semibold text-zinc-900">Logo</legend>
        {initial.logoPath ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamisches Logo (auch SVG)
          <img src={initial.logoPath} alt="Aktuelles Logo" className="h-12 w-auto rounded bg-zinc-100 p-1" />
        ) : (
          <p className="text-sm text-zinc-500">Noch kein Logo hochgeladen.</p>
        )}
        <input type="file" name="logo" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="text-sm" />
        <p className="text-xs text-zinc-400">PNG, JPG, WEBP oder SVG, max. 2 MB.</p>
      </fieldset>

      {/* Farben + Vorschau */}
      <fieldset className="flex flex-col gap-4">
        <legend className="font-heading text-lg font-semibold text-zinc-900">Farben</legend>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <ColorField name="colorNavbarBg" label="Navbar-Hintergrund" value={navbarBg} onChange={setNavbarBg} />
          <ColorField name="colorNavbarText" label="Navbar-Text" value={navbarText} onChange={setNavbarText} />
          <ColorField name="colorPageBg" label="Seiten-Hintergrund" value={pageBg} onChange={setPageBg} />
          <ColorField name="colorText" label="Textfarbe" value={text} onChange={setText} />
          <ColorField name="colorAccent" label="Akzentfarbe" value={accent} onChange={setAccent} />
          <ColorField name="colorFooterBg" label="Footer-Hintergrund" value={footerBg} onChange={setFooterBg} />
          <ColorField name="colorFooterText" label="Footer-Text" value={footerText} onChange={setFooterText} />
        </div>

        {/* Erweiterte / PWA-Farben */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <ColorField name="pwaThemeColor" label="PWA Theme-Farbe" value={pwaTheme} onChange={setPwaTheme} />
          <ColorField name="pwaBackgroundColor" label="PWA Hintergrund" value={pwaBg} onChange={setPwaBg} />
        </div>

        {/* Live-Vorschau */}
        <div className="overflow-hidden rounded-xl border border-zinc-200">
          <div
            className="flex items-center justify-between px-4 py-3 text-sm font-medium"
            style={{ background: navbarBg, color: navbarText }}
          >
            <span>{initial.companyName || "Mein Studio"}</span>
            <span
              className="rounded-md px-2.5 py-1 text-xs text-white"
              style={{ background: accent }}
            >
              Buchen
            </span>
          </div>
          <div className="px-4 py-6" style={{ background: pageBg, color: text }}>
            <p className="text-base font-semibold">Vorschau</p>
            <p className="mt-1 text-sm opacity-80">So sehen Navbar, Hintergrund und Text aus.</p>
          </div>
          <div className="px-4 py-3 text-xs" style={{ background: footerBg, color: footerText }}>
            © {initial.companyName || "Mein Studio"} – Footer
          </div>
        </div>
      </fieldset>

      {/* Schriftarten */}
      <fieldset className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <legend className="mb-1 font-heading text-lg font-semibold text-zinc-900">Schriftarten</legend>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Überschriften
          <select name="fontHeading" defaultValue={initial.fontHeading} className={textInput}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-zinc-700">
          Fliesstext
          <select name="fontBody" defaultValue={initial.fontBody} className={textInput}>
            {FONT_OPTIONS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-lg bg-zinc-900 px-5 py-2.5 text-base font-medium text-white hover:bg-zinc-700 disabled:opacity-60"
      >
        {pending ? "Speichern …" : "Branding speichern"}
      </button>
    </form>
  );
}
