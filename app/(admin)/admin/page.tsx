import type { Metadata } from "next";
import { requireRole } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Verwaltung",
};

export default async function AdminPage() {
  const user = await requireRole("owner", "admin");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Verwaltung</h1>
      <p className="mt-2 text-zinc-600">
        Willkommen, {user.firstName} ({user.role === "owner" ? "Owner" : "Mitarbeiter"})
      </p>

      {/* Termine, Dienstleistungen, Verfuegbarkeit und Branding folgen in spaeteren Phasen. */}

      <form action={logout} className="mt-8">
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Abmelden
        </button>
      </form>
    </main>
  );
}
