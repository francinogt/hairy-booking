"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/profile", label: "Mein Profil" },
  { href: "/admin/services", label: "Dienstleistungen" },
  { href: "/admin/availability", label: "Arbeitszeiten" },
];

const OWNER_LINKS = [
  { href: "/admin/users", label: "Benutzer" },
  { href: "/admin/branding", label: "Branding & Firma" },
];

export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname();
  const links = isOwner ? [...BASE_LINKS, ...OWNER_LINKS] : BASE_LINKS;

  return (
    <nav className="md:w-56 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className={`block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
