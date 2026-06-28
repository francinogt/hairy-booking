/**
 * Datums-Helfer fuer das MySQL-DATETIME-Format (naive Ortszeit, keine TZ-Konvertierung).
 * Die DB-Spalten laufen im String-Modus, mysql2 mit `dateStrings: true`.
 */

/** Formatiert ein Date als 'YYYY-MM-DD HH:MM:SS' aus den LOKALEN Komponenten. */
export function toMysqlDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  );
}

/** Parst einen naiven MySQL-DATETIME-String ('YYYY-MM-DD HH:MM:SS') als lokales Date. */
export function fromMysqlDateTime(s: string): Date {
  // Leerzeichen -> 'T' macht das Parsen robuster; ohne Zeitzone = lokal.
  return new Date(s.replace(" ", "T"));
}
