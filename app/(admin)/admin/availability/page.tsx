import type { Metadata } from "next";
import Link from "next/link";
import { getMyStaff, requireRole } from "@/lib/auth/dal";
import { listBlockedTime, listWorkingHours } from "@/data/availability";
import { deleteBlockedTimeAction } from "@/app/actions/staff";
import { fromMysqlDateTime } from "@/lib/datetime";
import { WorkingHoursForm } from "@/components/admin/working-hours-form";
import { BlockedTimeForm } from "@/components/admin/blocked-time-form";

export const metadata: Metadata = { title: "Arbeitszeiten" };

export default async function AvailabilityPage() {
  await requireRole("owner", "admin");
  const my = await getMyStaff();

  if (!my) {
    return (
      <section>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Arbeitszeiten</h1>
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Lege zuerst dein{" "}
          <Link href="/admin/profile" className="font-medium underline">
            Mitarbeiter-Profil
          </Link>{" "}
          an.
        </div>
      </section>
    );
  }

  const [hours, blocks] = await Promise.all([listWorkingHours(my.id), listBlockedTime(my.id)]);

  const initial: Record<string, { start: string; end: string } | undefined> = {};
  for (const h of hours) {
    if (!initial[h.weekday]) {
      initial[h.weekday] = { start: h.startTime.slice(0, 5), end: h.endTime.slice(0, 5) };
    }
  }

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Arbeitszeiten</h1>
        <p className="mt-1 text-zinc-600">Wöchentliche Zeiten und einmalige Sperrzeiten.</p>
      </div>

      <WorkingHoursForm initial={initial} />

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-zinc-900">Sperrzeiten</h2>

        {blocks.length === 0 ? (
          <p className="text-sm text-zinc-500">Keine Sperrzeiten eingetragen.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blocks.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5"
              >
                <span className="text-sm text-zinc-700">
                  {fromMysqlDateTime(b.startAt).toLocaleString("de-CH")} –{" "}
                  {fromMysqlDateTime(b.endAt).toLocaleString("de-CH")}
                  {b.reason ? ` · ${b.reason}` : ""}
                </span>
                <form action={deleteBlockedTimeAction}>
                  <input type="hidden" name="blockedId" value={b.id} />
                  <button
                    type="submit"
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Entfernen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <BlockedTimeForm />
      </div>
    </section>
  );
}
