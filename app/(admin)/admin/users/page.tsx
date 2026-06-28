import type { Metadata } from "next";
import { headers } from "next/headers";
import { requireOwner } from "@/lib/auth/dal";
import { listUsers } from "@/data/users";
import { listPendingInvitations } from "@/data/invitations";
import { revokeInvitation, setUserActive } from "@/app/actions/users";
import { fromMysqlDateTime } from "@/lib/datetime";
import { InviteForm } from "@/components/admin/invite-form";
import { CopyField } from "@/components/admin/copy-field";
import { UserResetPassword } from "@/components/admin/user-reset-password";

export const metadata: Metadata = { title: "Benutzer" };

const ROLE_LABEL: Record<string, string> = {
  owner: "Owner",
  admin: "Mitarbeiter",
  customer: "Kunde",
};

export default async function UsersPage() {
  const owner = await requireOwner();
  const [users, invites] = await Promise.all([listUsers(), listPendingInvitations()]);

  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") ?? "http"}://${
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  }`;

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Benutzer</h1>
        <p className="mt-1 text-zinc-600">Mitarbeiter und Kunden einladen und verwalten.</p>
      </div>

      <InviteForm />

      {/* Offene Einladungen */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Offene Einladungen</h2>
        {invites.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Keine offenen Einladungen.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {invites.map((inv) => {
              const expired = inv.expired;
              return (
                <li key={inv.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {inv.firstName} {inv.lastName} · {inv.email}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {ROLE_LABEL[inv.role]} ·{" "}
                        {expired ? (
                          <span className="text-red-600">abgelaufen</span>
                        ) : (
                          <>gültig bis {fromMysqlDateTime(inv.expiresAt).toLocaleDateString("de-CH")}</>
                        )}
                      </p>
                    </div>
                    <form action={revokeInvitation}>
                      <input type="hidden" name="invitationId" value={inv.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                      >
                        Zurückziehen
                      </button>
                    </form>
                  </div>
                  {!expired ? (
                    <div className="mt-3">
                      <CopyField value={`${origin}/invite/${inv.token}`} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Bestehende Benutzer */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Konten</h2>
        <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full min-w-xl text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-2.5">Name</th>
                <th className="px-4 py-2.5">E-Mail</th>
                <th className="px-4 py-2.5">Rolle</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2.5 text-zinc-900">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="px-4 py-2.5 text-zinc-600">{u.email}</td>
                  <td className="px-4 py-2.5 text-zinc-600">{ROLE_LABEL[u.role]}</td>
                  <td className="px-4 py-2.5">
                    {u.isActive ? (
                      <span className="text-green-700">aktiv</span>
                    ) : (
                      <span className="text-red-600">inaktiv</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    {u.id === owner.id ? (
                      <span className="flex justify-end text-xs text-zinc-400">—</span>
                    ) : (
                      <div className="flex flex-col items-end gap-2">
                        <UserResetPassword userId={u.id} />
                        {u.role !== "owner" ? (
                          <form action={setUserActive}>
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="active" value={u.isActive ? "false" : "true"} />
                            <button
                              type="submit"
                              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                            >
                              {u.isActive ? "Deaktivieren" : "Aktivieren"}
                            </button>
                          </form>
                        ) : null}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
