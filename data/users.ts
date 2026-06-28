import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, staffProfiles, users, type UserGender } from "@/db/schema";

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

/** Setzt einen neuen Passwort-Hash und invalidiert alle Sessions des Nutzers (erzwingt Neu-Login). */
export async function setUserPassword(id: number, passwordHash: string) {
  await db.update(users).set({ passwordHash }).where(eq(users.id, id));
  await db.delete(sessions).where(eq(sessions.userId, id));
}

/** true, wenn die E-Mail bereits einem ANDEREN Nutzer gehoert. */
export async function emailTakenByOther(email: string, excludeUserId: number): Promise<boolean> {
  const rows = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  return rows.length > 0 && rows[0].id !== excludeUserId;
}

export type ProfileValues = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: UserGender;
  addressLine: string | null;
  houseNumber: string | null;
  postalCode: string | null;
  city: string | null;
};

export async function updateMyProfile(userId: number, values: ProfileValues) {
  await db.update(users).set(values).where(eq(users.id, userId));
}
