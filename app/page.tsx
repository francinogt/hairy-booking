import Link from "next/link";
import { redirect } from "next/navigation";
import { getSettings } from "@/data/settings";
import { getCurrentUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/roles";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user) {
    // Eingeloggte direkt an ihren Bereich: Kunde -> Buchung, Mitarbeiter/Owner -> Verwaltung.
    redirect(isStaff(user.role) ? "/admin" : "/book");
  }

  const s = await getSettings();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {s.companyName}
      </h1>
      <p className="mt-3 max-w-md text-base opacity-70">
        Termine bequem online buchen – jederzeit und von überall.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/login"
          className="rounded-full bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition-opacity hover:opacity-90"
        >
          Anmelden &amp; buchen
        </Link>
        <Link
          href="/register"
          className="rounded-full border border-zinc-300 px-8 py-3 text-base font-medium text-zinc-800 transition-colors hover:bg-zinc-50"
        >
          Konto erstellen
        </Link>
      </div>
    </main>
  );
}
