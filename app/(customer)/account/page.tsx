import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/roles";
import { logout } from "@/app/actions/auth";
import { ProfileForm } from "@/components/account/profile-form";
import { ChangePasswordForm } from "@/components/account/change-password-form";
import { PushToggle } from "@/components/push-toggle";
import { listRequestsForCustomer } from "@/data/bookingRequests";

export const metadata: Metadata = {
  title: "Mein Konto",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In Prüfung",
  confirmed: "Bestätigt",
  declined: "Abgelehnt",
  cancelled: "Storniert",
};
const STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-700",
  cancelled: "bg-zinc-100 text-zinc-600",
};

export default async function AccountPage() {
  const user = await requireUser();
  const requests = await listRequestsForCustomer(user.id);

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

      {requests.length > 0 ? (
        <section className="mt-8">
          <h2 className="font-heading text-lg font-semibold text-zinc-900">Meine Anfragen</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {requests.map((r) => (
              <li key={r.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-zinc-900">
                    {r.skillName ?? "Tattoo"} · {r.staffDisplayName}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  {r.requestedStartAt ? `${r.requestedStartAt.slice(0, 16)} Uhr` : "Termin offen"}
                  {r.priceAmount ? ` · ${r.priceAmount} CHF` : ""}
                  {` · ca. ${(r.estimatedDurationMin / 60).toFixed(1)} Std`}
                </p>
                {r.staffNote ? (
                  <p className="mt-1 text-sm italic text-zinc-500">„{r.staffNote}“</p>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-8">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Benachrichtigungen</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Erhalte eine Push-Benachrichtigung, sobald sich der Status deiner Anfrage ändert.
        </p>
        <div className="mt-4">
          <PushToggle />
        </div>
      </section>

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
