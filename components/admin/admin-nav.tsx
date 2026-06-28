"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/requests", label: "Anfragen" },
  { href: "/admin/notifications", label: "Benachrichtigungen" },
  { href: "/admin/profile", label: "Mein Profil" },
  { href: "/admin/services", label: "Dienstleistungen" },
  { href: "/admin/availability", label: "Arbeitszeiten" },
];

const OWNER_LINKS = [
  { href: "/admin/skills", label: "Stile" },
  { href: "/admin/users", label: "Benutzer" },
  { href: "/admin/branding", label: "Branding & Firma" },
];

export function AdminNav({ isOwner, unreadCount = 0 }: { isOwner: boolean; unreadCount?: number }) {
  const pathname = usePathname();
  const links = isOwner ? [...BASE_LINKS, ...OWNER_LINKS] : BASE_LINKS;

  return (
    <nav className="md:w-56 md:shrink-0">
      <ul className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0">
        {links.map((l) => {
          const active = pathname === l.href;
          const badge = l.href === "/admin/notifications" && unreadCount > 0 ? unreadCount : null;
          return (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className={`flex items-center justify-between gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-accent text-white" : "text-zinc-700 hover:bg-zinc-100"
                }`}
              >
                <span>{l.label}</span>
                {badge ? (
                  <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                    {badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
