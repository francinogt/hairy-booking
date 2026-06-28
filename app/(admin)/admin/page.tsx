import type { Metadata } from "next";
import Link from "next/link";
import { getMyStaff, requireRole } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "Übersicht",
};

type Card = { href: string; title: string; text: string };

export default async function AdminDashboard() {
  const user = await requireRole("owner", "admin");
  const my = await getMyStaff();
  const isOwner = user.role === "owner";

  const cards: Card[] = [
    { href: "/admin/profile", title: "Mein Profil", text: "Anzeigename, Bio und Buchbarkeit." },
    { href: "/admin/services", title: "Dienstleistungen", text: "Angebote, Dauer und Preise." },
    { href: "/admin/availability", title: "Arbeitszeiten", text: "Wochenzeiten und Sperrzeiten." },
  ];
  if (isOwner) {
    cards.push(
      { href: "/admin/users", title: "Benutzer", text: "Mitarbeiter & Kunden einladen, verwalten." },
      { href: "/admin/branding", title: "Branding & Firma", text: "Logo, Farben, Schriften, Kontakt." },
    );
  }

  return (
    <section>
      <h1 className="font-heading text-2xl font-semibold text-zinc-900">Übersicht</h1>
      <p className="mt-1 text-zinc-600">
        Willkommen, {user.firstName} —{" "}
        <span className="font-medium">{isOwner ? "Owner" : "Mitarbeiter"}</span>.
      </p>

      {!my ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Du hast noch kein Mitarbeiter-Profil.{" "}
          <Link href="/admin/profile" className="font-medium underline">
            Jetzt anlegen
          </Link>{" "}
          – danach kannst du Dienstleistungen und Arbeitszeiten verwalten.
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
          >
            <p className="font-heading text-base font-semibold text-zinc-900">{c.title}</p>
            <p className="mt-1 text-sm text-zinc-600">{c.text}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
