import type { UserRole } from "@/db/schema";

export type { UserRole };

/** Rollen mit Zugriff auf den Admin-Bereich. */
export const STAFF_ROLES = ["owner", "admin"] as const satisfies readonly UserRole[];

export function isStaff(role: UserRole): boolean {
  return role === "owner" || role === "admin";
}

export function isOwner(role: UserRole): boolean {
  return role === "owner";
}
