import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { sessions, users, type User } from "@/db/schema";
import { toMysqlDateTime } from "@/lib/datetime";
import {
  SESSION_COOKIE,
  SESSION_DURATION_MS,
  SESSION_REFRESH_THRESHOLD_MS,
} from "@/lib/auth/constants";

/** sha256(token) als Hex — nur der Hash landet in der DB, das Klartext-Token im Cookie. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function sessionCookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

/**
 * Legt eine neue Session an und setzt das Cookie.
 * Nur aus Server Actions / Route Handlers aufrufen (Cookie-Schreibzugriff).
 */
export async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const id = hashToken(token);
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DURATION_MS);

  await db.insert(sessions).values({
    id,
    userId,
    expiresAt: toMysqlDateTime(expires),
    lastUsedAt: toMysqlDateTime(now),
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions(expires));
}

/**
 * Validiert die Session anhand des Cookies. Render-sicher: schreibt KEIN Cookie.
 * (Sliding-Window aktualisiert nur die DB; Cookie-Refresh passiert beim naechsten Login.)
 */
export async function validateSession(): Promise<{ user: User } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const id = hashToken(token);
  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, id))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const expiresAtMs = new Date(row.session.expiresAt.replace(" ", "T")).getTime();
  if (Number.isNaN(expiresAtMs) || expiresAtMs < Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, id));
    return null;
  }

  if (!row.user.isActive) return null;

  // Sliding Window: nur DB aktualisieren (kein Cookie-Schreiben im Render).
  if (expiresAtMs - Date.now() < SESSION_REFRESH_THRESHOLD_MS) {
    const now = new Date();
    await db
      .update(sessions)
      .set({
        expiresAt: toMysqlDateTime(new Date(now.getTime() + SESSION_DURATION_MS)),
        lastUsedAt: toMysqlDateTime(now),
      })
      .where(eq(sessions.id, id));
  }

  return { user: row.user };
}

/** Loescht die aktuelle Session in DB + Cookie. Nur aus Server Action / Route Handler. */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.delete(sessions).where(eq(sessions.id, hashToken(token)));
  }
  cookieStore.delete(SESSION_COOKIE);
}
