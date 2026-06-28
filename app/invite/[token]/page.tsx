import type { Metadata } from "next";
import { getValidInvitationByToken } from "@/data/invitations";
import { AcceptInviteForm } from "@/components/auth/accept-invite-form";

export const metadata: Metadata = { title: "Einladung annehmen" };

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const inv = await getValidInvitationByToken(token);

  if (!inv) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <h1 className="text-xl font-semibold text-zinc-900">Einladung ungültig</h1>
          <p className="mt-2 text-zinc-600">
            Diese Einladung ist abgelaufen oder wurde bereits verwendet. Bitte fordere eine neue an.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-1 text-2xl font-semibold text-zinc-900">Willkommen, {inv.firstName}!</h1>
        <p className="mb-6 text-sm text-zinc-600">
          Du wurdest als {inv.role === "admin" ? "Mitarbeiter" : "Kunde"} mit der Adresse{" "}
          <span className="font-medium">{inv.email}</span> eingeladen. Lege jetzt dein Passwort fest.
        </p>
        <AcceptInviteForm token={token} />
      </div>
    </main>
  );
}
