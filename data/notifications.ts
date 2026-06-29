import "server-only";
import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { notifications, type AppNotification, type NotificationType } from "@/db/schema";
import { sendPushToUser } from "@/lib/push/server";

export async function createNotification(input: {
  recipientUserId: number;
  type: NotificationType;
  title: string;
  body?: string | null;
  link?: string | null;
}): Promise<void> {
  await db.insert(notifications).values({
    recipientUserId: input.recipientUserId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    link: input.link ?? null,
  });

  // Zusaetzlich als Web-Push zustellen (Best-Effort: Fehler werden in
  // sendPushToUser abgefangen und blockieren die In-App-Notification nie).
  await sendPushToUser(input.recipientUserId, {
    title: input.title,
    body: input.body ?? undefined,
    url: input.link ?? undefined,
  });
}

export async function listNotificationsForUser(userId: number): Promise<AppNotification[]> {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.recipientUserId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function countUnread(userId: number): Promise<number> {
  const rows = await db
    .select({ id: notifications.id })
    .from(notifications)
    .where(and(eq(notifications.recipientUserId, userId), isNull(notifications.readAt)));
  return rows.length;
}

export async function markNotificationRead(id: number, userId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: toNow() })
    .where(and(eq(notifications.id, id), eq(notifications.recipientUserId, userId)));
}

export async function markAllRead(userId: number): Promise<void> {
  await db
    .update(notifications)
    .set({ readAt: toNow() })
    .where(and(eq(notifications.recipientUserId, userId), isNull(notifications.readAt)));
}

function toNow(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
