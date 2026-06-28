// Geteilte Auth-Konstanten OHNE `server-only`, damit sie auch in proxy.ts
// (separater Runtime) importiert werden koennen.
export const SESSION_COOKIE = "session";

/** Lebensdauer einer Session in Millisekunden (30 Tage). */
export const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 30;

/** Ab dieser Restlaufzeit wird die Session verlaengert (Sliding Window). */
export const SESSION_REFRESH_THRESHOLD_MS = SESSION_DURATION_MS / 2;
