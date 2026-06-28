"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { USER_GENDERS } from "@/db/schema";
import { emailTakenByOther, updateMyProfile } from "@/data/users";

export type ProfileState =
  | { error?: string; success?: boolean; fieldErrors?: Record<string, string[] | undefined> }
  | undefined;

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname ist erforderlich").max(80),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich").max(80),
  email: z.email("Bitte eine gültige E-Mail-Adresse eingeben").max(255),
  phone: z.string().trim().max(40).optional(),
  gender: z.enum(USER_GENDERS, { error: "Bitte Geschlecht wählen" }),
  addressLine: z.string().trim().max(160).optional(),
  houseNumber: z.string().trim().max(16).optional(),
  postalCode: z.string().trim().max(16).optional(),
  city: z.string().trim().max(80).optional(),
});

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireUser();

  const parsed = profileSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    gender: formData.get("gender"),
    addressLine: formData.get("addressLine") || undefined,
    houseNumber: formData.get("houseNumber") || undefined,
    postalCode: formData.get("postalCode") || undefined,
    city: formData.get("city") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const email = parsed.data.email.trim().toLowerCase();
  if (await emailTakenByOther(email, user.id)) {
    return { fieldErrors: { email: ["Diese E-Mail-Adresse ist bereits vergeben"] } };
  }

  await updateMyProfile(user.id, {
    firstName: parsed.data.firstName,
    lastName: parsed.data.lastName,
    email,
    phone: parsed.data.phone ?? null,
    gender: parsed.data.gender,
    addressLine: parsed.data.addressLine ?? null,
    houseNumber: parsed.data.houseNumber ?? null,
    postalCode: parsed.data.postalCode ?? null,
    city: parsed.data.city ?? null,
  });

  revalidatePath("/account");
  return { success: true };
}
