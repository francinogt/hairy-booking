import "server-only";
import { randomBytes } from "node:crypto";
import { desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  invitations,
  staffProfiles,
  users,
  type Invitation,
  type InviteRole,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { fromMysqlDateTime, toMysqlDateTime } from "@/lib/datetime";
import { uniqueSlug } from "@/data/staff";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 Tage

export async function createInvitation(input: {
  email: string;
  role: InviteRole;
  firstName: string;
  lastName: string;
  displayName?: string | null;
  invitedByUserId: number;
}): Promise<{ id: number; token: string }> {
  const token = randomBytes(32).toString("hex"); // 64 Hex-Zeichen
  const expiresAt = toMysqlDateTime(new Date(Date.now() + INVITE_TTL_MS));
  const [{ id }] = await db
    .insert(invitations)
    .values({
      token,
      email: input.email.trim().toLowerCase(),
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName ?? null,
      invitedByUserId: input.invitedByUserId,
      expiresAt,
    })
    .$returningId();
  return { id, token };
}

export async function listPendingInvitations(): Promise<Array<Invitation & { expired: boolean }>> {
  const rows = await db
    .select()
    .from(invitations)
    .where(isNull(invitations.acceptedAt))
    .orderBy(desc(invitations.createdAt));
  const now = Date.now();
  return rows.map((r) => ({ ...r, expired: fromMysqlDateTime(r.expiresAt).getTime() < now }));
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  const rows = await db.select().from(invitations).where(eq(invitations.token, token)).limit(1);
  return rows[0] ?? null;
}

/** Liefert die Einladung nur, wenn sie gueltig ist (offen + nicht abgelaufen), sonst null. */
export async function getValidInvitationByToken(token: string): Promise<Invitation | null> {
  const inv = await getInvitationByToken(token);
  if (!inv || inv.acceptedAt) return null;
  if (fromMysqlDateTime(inv.expiresAt).getTime() < Date.now()) return null;
  return inv;
}

export async function revokeInvitation(id: number) {
  await db.delete(invitations).where(eq(invitations.id, id));
}

export type AcceptResult =
  | { ok: true; userId: number; role: InviteRole }
  | { ok: false; error: string };

/**
 * Nimmt eine Einladung an: legt User (+ ggf. Mitarbeiter-Profil) an und markiert
 * die Einladung als verwendet — atomar in einer Transaktion.
 */
export async function acceptInvitation(token: string, password: string): Promise<AcceptResult> {
  const inv = await getInvitationByToken(token);
  if (!inv) return { ok: false, error: "Einladung ungueltig." };
  if (inv.acceptedAt) return { ok: false, error: "Einladung wurde bereits verwendet." };
  if (fromMysqlDateTime(inv.expiresAt).getTime() < Date.now()) {
    return { ok: false, error: "Einladung ist abgelaufen." };
  }

  const email = inv.email.trim().toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) {
    return { ok: false, error: "Es existiert bereits ein Konto mit dieser E-Mail-Adresse." };
  }

  const passwordHash = await hashPassword(password);
  const slug =
    inv.role === "admin"
      ? await uniqueSlug(inv.displayName || `${inv.firstName} ${inv.lastName}`)
      : null;

  const userId = await db.transaction(async (tx) => {
    const [{ id }] = await tx
      .insert(users)
      .values({
        role: inv.role,
        email,
        passwordHash,
        firstName: inv.firstName,
        lastName: inv.lastName,
      })
      .$returningId();

    if (inv.role === "admin" && slug) {
      await tx.insert(staffProfiles).values({
        userId: id,
        displayName: inv.displayName || `${inv.firstName} ${inv.lastName}`.trim(),
        slug,
      });
    }

    await tx
      .update(invitations)
      .set({ acceptedAt: toMysqlDateTime(new Date()) })
      .where(eq(invitations.id, inv.id));

    return id;
  });

  return { ok: true, userId, role: inv.role };
}
