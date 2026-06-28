import type { Metadata } from "next";
import Link from "next/link";
import { getMyStaff, requireRole } from "@/lib/auth/dal";
import { listServicesByStaff } from "@/data/services";
import { deleteServiceAction } from "@/app/actions/staff";
import { ServiceForm } from "@/components/admin/service-form";

export const metadata: Metadata = { title: "Dienstleistungen" };

export default async function ServicesPage() {
  await requireRole("owner", "admin");
  const my = await getMyStaff();

  if (!my) {
    return (
      <section>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Dienstleistungen</h1>
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

  const services = await listServicesByStaff(my.id);

  return (
    <section className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Dienstleistungen</h1>
        <p className="mt-1 text-zinc-600">Deine buchbaren Angebote.</p>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-zinc-500">Noch keine Dienstleistungen angelegt.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {services.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-zinc-900">{s.name}</p>
                <p className="text-sm text-zinc-500">
                  {s.durationMin} Min · CHF {s.priceAmount}
                  {s.isActive ? "" : " · inaktiv"}
                </p>
              </div>
              <form action={deleteServiceAction}>
                <input type="hidden" name="serviceId" value={s.id} />
                <button
                  type="submit"
                  className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Löschen
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <ServiceForm />
    </section>
  );
}
