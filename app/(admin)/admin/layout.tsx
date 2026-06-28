import { requireRole } from "@/lib/auth/dal";
import { AdminNav } from "@/components/admin/admin-nav";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Gate fuer den gesamten Admin-Bereich. Einzelne Seiten/Actions pruefen zusaetzlich
  // (Owner-only bzw. staff-scoped) — das Layout ist nicht die alleinige Grenze.
  const user = await requireRole("owner", "admin");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6 md:flex-row md:py-10">
      <AdminNav isOwner={user.role === "owner"} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
