import Link from "next/link";
import { getSettings } from "@/data/settings";

export default async function HomePage() {
  const s = await getSettings();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        {s.companyName}
      </h1>
      <p className="mt-3 max-w-md text-base opacity-70">
        Termine bequem online buchen – jederzeit und von überall.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-full bg-accent px-8 py-3 text-base font-medium text-white shadow-sm transition-opacity hover:opacity-90"
      >
        Termin buchen
      </Link>
    </main>
  );
}
