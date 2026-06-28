"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/dal";
import { markAllRead, markNotificationRead } from "@/data/notifications";

export async function markNotificationReadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("notificationId"));
  if (!Number.isFinite(id)) return;
  await markNotificationRead(id, user.id);
  revalidatePath("/admin", "layout");
}

export async function markAllReadAction(): Promise<void> {
  const user = await requireUser();
  await markAllRead(user.id);
  revalidatePath("/admin", "layout");
}
