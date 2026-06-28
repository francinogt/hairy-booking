import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, staffProfiles, users } from "@/db/schema";

export async function listUsers() {
  return db
    .select({
      id: users.id,
      role: users.role,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      isActive: users.isActive,
      createdAt: users.createdAt,
      staffId: staffProfiles.id,
    })
    .from(users)
    .leftJoin(staffProfiles, eq(staffProfiles.userId, users.id))
    .orderBy(desc(users.createdAt));
}

/**
 * Aktiviert/deaktiviert einen Nutzer. Beim Deaktivieren werden zusaetzlich alle
 * Sessions geloescht (sofortiger Logout; validateSession lehnt inaktive ohnehin ab).
 */
export async function setUserActive(id: number, active: boolean) {
  await db.update(users).set({ isActive: active }).where(eq(users.id, id));
  if (!active) {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }
}
