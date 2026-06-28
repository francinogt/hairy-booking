"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { loginSchema, registerSchema } from "@/lib/auth/schemas";
import { acceptInvitation } from "@/data/invitations";

export type AuthState =
  | {
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return { fieldErrors: { email: ["Diese E-Mail-Adresse ist bereits registriert"] } };
  }

  const passwordHash = await hashPassword(data.password);
  const [{ id: newUserId }] = await db
    .insert(users)
    .values({
      role: "customer",
      email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
    })
    .$returningId();

  await createSession(newUserId);
  redirect("/account");
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  const GENERIC_ERROR = "E-Mail oder Passwort ist falsch.";

  if (!parsed.success) {
    return { error: "Bitte E-Mail und Passwort eingeben." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = rows[0];

  if (!user || !user.isActive) {
    return { error: GENERIC_ERROR };
  }

  const ok = await verifyPassword(user.passwordHash, parsed.data.password);
  if (!ok) {
    return { error: GENERIC_ERROR };
  }

  await createSession(user.id);
  redirect(user.role === "customer" ? "/account" : "/admin");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

const acceptSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(10, "Das Passwort muss mindestens 10 Zeichen lang sein")
    .max(200, "Das Passwort ist zu lang"),
});

export async function acceptInvite(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = acceptSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const result = await acceptInvitation(parsed.data.token, parsed.data.password);
  if (!result.ok) {
    return { error: result.error };
  }

  await createSession(result.userId);
  redirect(result.role === "admin" ? "/admin" : "/account");
}
