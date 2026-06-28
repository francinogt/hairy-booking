"use server";

import { randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireOwner } from "@/lib/auth/dal";
import { hashPassword } from "@/lib/auth/password";
import { INVITE_ROLES } from "@/db/schema";
import { createInvitation, revokeInvitation as revokeInvitationData } from "@/data/invitations";
import { setUserActive as setUserActiveData, setUserPassword } from "@/data/users";

const inviteSchema = z.object({
  email: z.email("Bitte eine gueltige E-Mail-Adresse eingeben"),
  role: z.enum(INVITE_ROLES),
  firstName: z.string().trim().min(1, "Vorname ist erforderlich").max(80),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich").max(80),
  displayName: z.string().trim().max(120).optional(),
});

export type InviteState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
      inviteUrl?: string;
      invitedEmail?: string;
    }
  | undefined;

export async function inviteUser(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const owner = await requireOwner();

  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    displayName: formData.get("displayName") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  const { token } = await createInvitation({
    email: data.email,
    role: data.role,
    firstName: data.firstName,
    lastName: data.lastName,
    displayName:
      data.role === "admin" ? data.displayName || `${data.firstName} ${data.lastName}` : null,
    invitedByUserId: owner.id,
  });

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? "http";
  const inviteUrl = `${proto}://${host}/invite/${token}`;

  revalidatePath("/admin/users");
  return { inviteUrl, invitedEmail: data.email };
}

export async function setUserActive(formData: FormData): Promise<void> {
  const owner = await requireOwner();
  const id = Number(formData.get("userId"));
  const active = formData.get("active") === "true";
  if (!Number.isFinite(id) || id === owner.id) return; // sich selbst nicht deaktivieren
  await setUserActiveData(id, active);
  revalidatePath("/admin/users");
}

export async function revokeInvitation(formData: FormData): Promise<void> {
  await requireOwner();
  const id = Number(formData.get("invitationId"));
  if (!Number.isFinite(id)) return;
  await revokeInvitationData(id);
  revalidatePath("/admin/users");
}

export type ResetPasswordState = { error?: string; tempPassword?: string } | undefined;

export async function resetUserPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  await requireOwner();
  const id = Number(formData.get("userId"));
  if (!Number.isFinite(id)) return { error: "Ungültiger Benutzer." };

  // 12-stelliges temporäres Passwort (base64url, keine Mehrdeutigkeit nötig)
  const tempPassword = randomBytes(9).toString("base64url");
  const passwordHash = await hashPassword(tempPassword);
  await setUserPassword(id, passwordHash);

  revalidatePath("/admin/users");
  return { tempPassword };
}
