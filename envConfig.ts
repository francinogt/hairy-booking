// Laedt .env*-Dateien fuer Tools, die ausserhalb der Next.js-Runtime laufen
// (drizzle-kit, Seed-Script). Innerhalb von Next werden Env-Variablen automatisch geladen.
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
