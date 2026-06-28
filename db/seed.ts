// Seed: legt die Single-Row `settings` und einen initialen Owner-Account an.
// Idempotent (kein RETURNING / ON CONFLICT in MySQL -> SELECT, dann INSERT).
// Ausfuehren via: npm run db:seed
import "../envConfig";
import { eq } from "drizzle-orm";
import { db } from "./index";
import { settings, users } from "./schema";
import { hashPassword } from "../lib/auth/password";

async function main() {
  // 1) Default-Settings (Single-Row, id wird zu 1)
  const existingSettings = await db.select({ id: settings.id }).from(settings).limit(1);
  if (existingSettings.length === 0) {
    await db.insert(settings).values({});
    console.log("✔ settings (Defaults) angelegt");
  } else {
    console.log("• settings existiert bereits");
  }

  // 2) Initialer Owner
  const email = (process.env.OWNER_EMAIL ?? "owner@example.ch").trim().toLowerCase();
  const password = process.env.OWNER_PASSWORD ?? "ChangeMe-123!";
  const firstName = process.env.OWNER_FIRST_NAME ?? "Admin";
  const lastName = process.env.OWNER_LAST_NAME ?? "Owner";

  const existingOwner = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingOwner.length === 0) {
    const passwordHash = await hashPassword(password);
    await db.insert(users).values({
      role: "owner",
      email,
      passwordHash,
      firstName,
      lastName,
    });
    console.log(`✔ Owner ${email} angelegt`);
  } else {
    console.log(`• Owner ${email} existiert bereits`);
  }

  console.log("Seed abgeschlossen.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed fehlgeschlagen:", err);
  process.exit(1);
});
