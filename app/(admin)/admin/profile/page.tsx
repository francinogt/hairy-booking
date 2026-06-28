import type { Metadata } from "next";
import { getMyStaff, requireRole } from "@/lib/auth/dal";
import { ProfileForm } from "@/components/admin/profile-form";

export const metadata: Metadata = { title: "Mein Profil" };

export default async function ProfilePage() {
  await requireRole("owner", "admin");
  const my = await getMyStaff();

  return (
    <section>
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
    </section>
  );
}
