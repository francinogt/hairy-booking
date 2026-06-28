"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getMyStaff, requireRole, requireStaffAccess } from "@/lib/auth/dal";
import { WEEKDAYS, type Weekday } from "@/db/schema";
import { createStaffProfile, updateStaffProfile } from "@/data/staff";
import { createService, deleteService, getServiceById } from "@/data/services";
import { addBlockedTime, deleteBlockedTime, replaceWorkingHours } from "@/data/availability";

export type StaffState =
  | { error?: string; success?: boolean; fieldErrors?: Record<string, string[] | undefined> }
  | undefined;

/** 'YYYY-MM-DDTHH:MM' (datetime-local) -> 'YYYY-MM-DD HH:MM:00' oder null. */
function parseLocalInput(value: string): string | null {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
  return m ? `${m[1]} ${m[2]}:00` : null;
}

// --- Mitarbeiter-Profil ---------------------------------------------------
const profileSchema = z.object({
  displayName: z.string().trim().min(1, "Anzeigename ist erforderlich").max(120),
  specialty: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(2000).optional(),
});

export async function saveMyProfile(_prev: StaffState, formData: FormData): Promise<StaffState> {
  const user = await requireRole("owner", "admin");
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    specialty: formData.get("specialty") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  const isBookable = formData.get("isBookable") === "on";

  const my = await getMyStaff();
  if (my) {
    await updateStaffProfile(my.id, {
      displayName: parsed.data.displayName,
      specialty: parsed.data.specialty ?? null,
      bio: parsed.data.bio ?? null,
      isBookable,
    });
  } else {
    await createStaffProfile({
      userId: user.id,
      displayName: parsed.data.displayName,
      specialty: parsed.data.specialty ?? null,
      bio: parsed.data.bio ?? null,
    });
  }
  revalidatePath("/admin/profile");
  revalidatePath("/", "layout");
  return { success: true };
}

// --- Dienstleistungen -----------------------------------------------------
const serviceSchema = z.object({
  name: z.string().trim().min(1, "Name ist erforderlich").max(120),
  durationMin: z.coerce.number().int("Ganze Minuten").min(5, "Mindestens 5 Minuten").max(600),
  priceAmount: z.coerce.number().min(0, "Preis darf nicht negativ sein").max(99_999_999),
  description: z.string().trim().max(2000).optional(),
});

export async function createServiceAction(_prev: StaffState, formData: FormData): Promise<StaffState> {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  if (!my) return { error: "Bitte lege zuerst dein Mitarbeiter-Profil an." };
  await requireStaffAccess(my.id);

  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    durationMin: formData.get("durationMin"),
    priceAmount: formData.get("priceAmount"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  await createService({
    staffId: my.id,
    name: parsed.data.name,
    durationMin: parsed.data.durationMin,
    priceAmount: parsed.data.priceAmount.toFixed(2),
    description: parsed.data.description ?? null,
  });
  revalidatePath("/admin/services");
  return { success: true };
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  await requireRole("owner", "admin");
  const id = Number(formData.get("serviceId"));
  if (!Number.isFinite(id)) return;
  const svc = await getServiceById(id);
  if (!svc) return;
  await requireStaffAccess(svc.staffId); // Owner ok; Mitarbeiter nur eigene
  await deleteService(id);
  revalidatePath("/admin/services");
}

// --- Arbeitszeiten & Sperrzeiten ------------------------------------------
export async function saveWorkingHours(_prev: StaffState, formData: FormData): Promise<StaffState> {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  if (!my) return { error: "Bitte lege zuerst dein Mitarbeiter-Profil an." };
  await requireStaffAccess(my.id);

  const rows: { weekday: Weekday; startTime: string; endTime: string }[] = [];
  for (const day of WEEKDAYS) {
    const enabled = formData.get(`${day}_enabled`) === "on";
    const start = String(formData.get(`${day}_start`) ?? "");
    const end = String(formData.get(`${day}_end`) ?? "");
    if (enabled && /^\d{2}:\d{2}$/.test(start) && /^\d{2}:\d{2}$/.test(end) && start < end) {
      rows.push({ weekday: day, startTime: `${start}:00`, endTime: `${end}:00` });
    }
  }
  await replaceWorkingHours(my.id, rows);
  revalidatePath("/admin/availability");
  return { success: true };
}

export async function addBlockedTimeAction(_prev: StaffState, formData: FormData): Promise<StaffState> {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  if (!my) return { error: "Bitte lege zuerst dein Mitarbeiter-Profil an." };
  await requireStaffAccess(my.id);

  const start = parseLocalInput(String(formData.get("startAt") ?? ""));
  const end = parseLocalInput(String(formData.get("endAt") ?? ""));
  if (!start || !end || end <= start) {
    return { error: "Bitte einen gueltigen Zeitraum angeben (Ende nach Start)." };
  }
  await addBlockedTime({
    staffId: my.id,
    startAt: start,
    endAt: end,
    reason: String(formData.get("reason") ?? "").trim() || null,
  });
  revalidatePath("/admin/availability");
  return { success: true };
}

export async function deleteBlockedTimeAction(formData: FormData): Promise<void> {
  await requireRole("owner", "admin");
  const my = await getMyStaff();
  if (!my) return;
  const id = Number(formData.get("blockedId"));
  if (!Number.isFinite(id)) return;
  await deleteBlockedTime(id, my.id); // gescoped auf eigenen Staff
  revalidatePath("/admin/availability");
}
