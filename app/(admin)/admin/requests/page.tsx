import type { Metadata } from "next";
import { getMyStaff, requireRole } from "@/lib/auth/dal";
import { listPendingRequests } from "@/data/bookingRequests";
import { BODY_PART_LABELS, type BodyPartKey, isBodyPartKey } from "@/lib/booking/body-parts";
import { RequestCard, type RequestCardData } from "@/components/admin/request-card";

export const metadata: Metadata = { title: "Anfragen" };

export default async function RequestsPage() {
  const user = await requireRole("owner", "admin");

  let requests: Awaited<ReturnType<typeof listPendingRequests>> = [];
  if (user.role === "owner") {
    requests = await listPendingRequests();
  } else {
    const my = await getMyStaff();
    requests = my ? await listPendingRequests(my.id) : [];
  }

  const cards: RequestCardData[] = requests.map((r) => {
    const img = r.images[0];
    const parts = img?.coveredParts ?? [];
    const coveredLabels = parts
      .filter(isBodyPartKey)
      .map((k) => BODY_PART_LABELS[k as BodyPartKey])
      .join(", ");
    const start = r.requestedStartAt ?? "";
    return {
      id: r.id,
      customerName: `${r.customerFirst} ${r.customerLast}`,
      customerEmail: r.customerEmail,
      skillName: r.skillName,
      staffDisplayName: r.staffDisplayName,
      coveredLabels,
      imagePath: img?.imagePath ?? null,
      figureKind: r.genderUsed === "female" ? "female" : "male",
      view: r.bodyView === "back" ? "back" : "front",
      placement: img
        ? {
            x: img.x,
            y: img.y,
            scale: img.scale,
            rotationDeg: img.rotationDeg,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight,
          }
        : null,
      coveredParts: parts,
      requestedStartLocal: start ? start.slice(0, 16).replace(" ", "T") : "",
      requestedStartDisplay: start ? `${start.slice(0, 16)} Uhr` : "",
      estimatedDurationMin: r.estimatedDurationMin,
      priceAmount: r.priceAmount,
      customerNote: r.customerNote,
    };
  });

  return (
    <section>
      <h1 className="font-heading text-2xl font-semibold text-zinc-900">Anfragen</h1>
      <p className="mt-1 text-zinc-600">
        Offene Buchungsanfragen{user.role === "owner" ? " (alle Mitarbeiter)" : ""} – Preis, Dauer und
        Startzeit prüfen und bestätigen.
      </p>

      {cards.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-500">Keine offenen Anfragen.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-4">
          {cards.map((c) => (
            <RequestCard key={c.id} data={c} showStaff={user.role === "owner"} />
          ))}
        </ul>
      )}
    </section>
  );
}
