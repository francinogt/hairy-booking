import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

/**
 * MySQL-Pool als Singleton (verhindert Connection-Leaks bei HMR im Dev).
 *
 * `dateStrings: true` -> mysql2 liefert DATE/DATETIME/TIMESTAMP als String zurueck.
 * Das passt zum `mode: "string"` der Datums-Spalten im Schema und vermeidet jede
 * implizite Zeitzonen-Konvertierung (naive Ortszeit in der Firmen-Zeitzone).
 */
function createPool(): mysql.Pool {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL ist nicht gesetzt. Lege eine .env mit z.B. " +
        "DATABASE_URL=mysql://hairy_booking:PASSWORT@localhost:3306/hairy_booking an.",
    );
  }
  const parsed = new URL(url);
  return mysql.createPool({
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    charset: "utf8mb4",
    dateStrings: true,
    connectionLimit: 10,
  });
}

const globalForDb = globalThis as unknown as { _hairyPool?: mysql.Pool };
const pool = globalForDb._hairyPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb._hairyPool = pool;

export const db = drizzle(pool, { schema, mode: "default" });
export { schema };
export type DB = typeof db;
