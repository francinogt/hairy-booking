import type { Metadata } from "next";
import { getMyStaff, requireRole } from "@/lib/auth/dal";
import { listSkillIdsForStaff, listSkills } from "@/data/skills";
import { getStaffRates } from "@/data/rates";
import { ProfileForm } from "@/components/admin/profile-form";
import { StaffSkillsForm } from "@/components/admin/staff-skills-form";
import { StaffRatesForm } from "@/components/admin/staff-rates-form";

export const metadata: Metadata = { title: "Mein Profil" };

export default async function ProfilePage() {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  const [skills, mySkillIds, myRates] = await Promise.all([
    listSkills({ activeOnly: true }),
    my ? listSkillIdsForStaff(my.id) : Promise.resolve<number[]>([]),
    my ? getStaffRates(my.id) : Promise.resolve<{ skillId: number; hourlyRate: string }[]>([]),
  ]);

  const mySkillIdSet = new Set(mySkillIds);
  const rateMap = new Map(myRates.map((r) => [r.skillId, r.hourlyRate]));
  const rateRows = skills
    .filter((s) => mySkillIdSet.has(s.id))
    .map((s) => ({ skillId: s.id, name: s.name, hourlyRate: rateMap.get(s.id) ?? "" }));

  return (
    <section className="flex flex-col gap-10">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-zinc-900">Mein Profil</h1>
        <p className="mt-1 text-zinc-600">
          Dein öffentliches Mitarbeiter-Profil für die Online-Buchung.
        </p>
        <div className="mt-6">
          <ProfileForm
            initial={
              my
                ? {
                    displayName: my.displayName,
                    specialty: my.specialty ?? "",
                    bio: my.bio ?? "",
                    isBookable: my.isBookable,
                    slug: my.slug,
                  }
                : null
            }
          />
        </div>
      </div>

      {my ? (
        <>
          <div>
            <h2 className="font-heading text-lg font-semibold text-zinc-900">Meine Stile</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Nur Kunden, die einen deiner Stile wählen, können dich als Artist auswählen.
            </p>
            <div className="mt-4">
              <StaffSkillsForm
                skills={skills.map((s) => ({ id: s.id, name: s.name }))}
                selected={mySkillIds}
              />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-lg font-semibold text-zinc-900">Stundensätze pro Stil</h2>
            <p className="mt-1 text-sm text-zinc-500">
              CHF pro Stunde je Stil. Daraus wird dem Kunden ein Richtpreis geschätzt (du passt den
              finalen Preis bei der Freigabe an).
            </p>
            <div className="mt-4">
              <StaffRatesForm rows={rateRows} />
            </div>
          </div>
        </>
      ) : null}
    </section>
  );
}
