import { z } from "zod";

// zod v4: String-Formate sind Top-Level-Funktionen (z.email()).
export const registerSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname ist erforderlich").max(80),
  lastName: z.string().trim().min(1, "Nachname ist erforderlich").max(80),
  email: z.email("Bitte eine gueltige E-Mail-Adresse eingeben").max(255),
  phone: z.string().trim().max(40).optional(),
  password: z
    .string()
    .min(10, "Das Passwort muss mindestens 10 Zeichen lang sein")
    .max(200, "Das Passwort ist zu lang"),
});

export const loginSchema = z.object({
  email: z.email("Bitte eine gueltige E-Mail-Adresse eingeben"),
  password: z.string().min(1, "Passwort ist erforderlich"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
