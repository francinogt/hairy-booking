import type { Metadata } from "next";
import { requireOwner } from "@/lib/auth/dal";
import { listSkills } from "@/data/skills";
import { SkillCatalog } from "@/components/admin/skill-catalog";

export const metadata: Metadata = { title: "Stile" };

export default async function SkillsPage() {
  await requireOwner();
  const skills = await listSkills();

  return (
    <section>
      <h1 className="font-heading text-2xl font-semibold text-zinc-900">Stile / Tattoo-Arten</h1>
      <p className="mt-1 text-zinc-600">
        Diese Stile wählen Kunden bei der Buchung. Jeder Mitarbeiter ordnet sich seine Stile im Profil zu.
      </p>
      <div className="mt-6">
        <SkillCatalog
          skills={skills.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            isActive: s.isActive,
          }))}
        />
      </div>
    </section>
  );
}
