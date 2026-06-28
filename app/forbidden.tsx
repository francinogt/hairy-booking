import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-5xl font-bold text-zinc-900">403</p>
      <h1 className="text-xl font-semibold text-zinc-900">Kein Zugriff</h1>
      <p className="text-zinc-600">
        Du hast keine Berechtigung, diese Seite zu sehen.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Zur Startseite
      </Link>
    </main>
  );
}
