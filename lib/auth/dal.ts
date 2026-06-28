import "server-only";
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staffProfiles, type StaffProfile, type User, type UserRole } from "@/db/schema";
import { validateSession } from "@/lib/auth/session";

/** Nutzer-DTO ohne Passwort-Hash (wird an UI weitergegeben). */
export type SessionUser = Omit<User, "passwordHash">;

function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    role: u.role,
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    phone: u.phone,
    emailVerifiedAt: u.emailVerifiedAt,
    isActive: u.isActive,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
}

/** Aktueller Nutzer oder null. Pro Render-Durchlauf memoisiert. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const result = await validateSession();
  return result ? toSessionUser(result.user) : null;
});

/** Erzwingt Login; leitet sonst auf /login um. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Erzwingt Login + eine der Rollen; sonst /login bzw. forbidden(). */
export async function requireRole(...roles: UserRole[]): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!roles.includes(user.role)) forbidden();
  return user;
}

/** Erzwingt die Owner-Rolle. */
export async function requireOwner(): Promise<SessionUser> {
  return requireRole("owner");
}

/** Mitarbeiter-Profil des aktuellen Users (oder null). Pro Render memoisiert. */
export const getMyStaff = cache(async (): Promise<StaffProfile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await db
    .select()
    .from(staffProfiles)
    .where(eq(staffProfiles.userId, user.id))
    .limit(1);
  return rows[0] ?? null;
});

/**
 * Zugriff auf staff-gebundene Ressourcen: Owner darf alles, ein Mitarbeiter (admin)
 * nur sein eigenes `staffId`. In JEDER staff-scoped Action aufrufen (IDOR-Schutz).
 */
export async function requireStaffAccess(staffId: number): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "owner") return user;
  if (user.role === "admin") {
    const staff = await getMyStaff();
    if (staff && staff.id === staffId) return user;
  }
  forbidden();
}
