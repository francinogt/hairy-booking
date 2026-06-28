import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id (Default-Algorithmus von @node-rs/argon2) mit OWASP-Standardparametern.
 * Bewusst OHNE `server-only`, damit das Seed-Script (Node) das Modul nutzen kann.
 * Hashing ist rein rechnerisch und kann gefahrlos serverseitig ueberall laufen.
 * (Kein `Algorithm`-Enum: ambient const enum + isolatedModules vertragen sich nicht.)
 */
const OPTIONS = {
  memoryCost: 19456, // ~19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTIONS);
}

export function verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
  return verify(passwordHash, plain, OPTIONS);
}
