import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/roles";
import { listSkills } from "@/data/skills";
import { listBookableStaffWithSkills } from "@/data/staff";
import { getSettings } from "@/data/settings";
import { BookingWizard } from "@/components/booking/booking-wizard";

export const metadata: Metadata = { title: "Termin buchen" };

export default async function BookPage() {
  const user = await requireUser();
  if (isStaff(user.role)) redirect("/admin");

  const [skills, artists, settings] = await Promise.all([
    listSkills({ activeOnly: true }),
    listBookableStaffWithSkills(),
    getSettings(),
  ]);

  const profileComplete = Boolean(
    user.gender && user.addressLine && user.postalCode && user.city,
  );
  const figureKindDefault = user.gender === "female" ? "female" : "male";

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <h1 className="font-heading text-2xl font-semibold text-zinc-900">Termin buchen</h1>
      <p className="mt-1 text-zinc-600">
        Hallo {user.firstName}! Folge den Schritten für deine Tattoo-Anfrage.
      </p>
      <div className="mt-6">
        <BookingWizard
          skills={skills.map((s) => ({ id: s.id, name: s.name, description: s.description }))}
          artists={artists}
          minPrice={Number(settings.minPriceAmount)}
          figureKindDefault={figureKindDefault}
          profileComplete={profileComplete}
          slotIntervalMin={settings.slotIntervalMin}
          bookingHorizonDays={settings.bookingHorizonDays}
          timezone={settings.timezone}
        />
      </div>
    </main>
  );
}
