import "server-only";
import { cache } from "react";
import { forbidden, redirect } from "next/navigation";
import type { User, UserRole } from "@/db/schema";
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
