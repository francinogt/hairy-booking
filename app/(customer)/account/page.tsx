import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Mein Konto",
};

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="text-2xl font-semibold text-zinc-900">Mein Konto</h1>
      <p className="mt-2 text-zinc-600">
        Angemeldet als {user.firstName} {user.lastName} ({user.email})
      </p>

      {/* Buchungshistorie folgt in einer spaeteren Phase. */}

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
