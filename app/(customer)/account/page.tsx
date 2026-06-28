import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/roles";
import { logout } from "@/app/actions/auth";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";

export const metadata: Metadata = {
  title: "Mein Konto",
};

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold text-zinc-900">Mein Konto</h1>
      <p className="mt-2 text-zinc-600">
        Angemeldet als {user.firstName} {user.lastName} ({user.email})
      </p>

      {isStaff(user.role) ? (
        <p className="mt-3 text-sm">
          <Link href="/admin" className="font-medium text-accent underline">
            → Zur Verwaltung
          </Link>
        </p>
      ) : null}

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Persönliche Daten</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Diese Angaben werden für deine Buchungen verwendet.
        </p>
        <div className="mt-4">
          <ProfileForm
            initial={{
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              phone: user.phone ?? "",
              gender: user.gender ?? "",
              addressLine: user.addressLine ?? "",
              houseNumber: user.houseNumber ?? "",
              postalCode: user.postalCode ?? "",
              city: user.city ?? "",
            }}
          />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Passwort ändern</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Du bleibst auf diesem Gerät angemeldet; andere Geräte werden abgemeldet.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </section>

      <form action={logout} className="mt-10">
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
