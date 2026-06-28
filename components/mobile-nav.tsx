"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/app/actions/auth";
import type { NavLink } from "@/components/navbar";

export function MobileNav({ links, isLoggedIn }: { links: NavLink[]; isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label="Menü"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="-mr-2 inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <>
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </>
          ) : (
            <>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </>
          )}
        </svg>
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-16 z-50 border-t border-white/10 bg-navbar text-navbar-foreground shadow-lg">
          <div className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-base font-medium hover:bg-white/10"
              >
                {l.label}
              </Link>
            ))}
            {isLoggedIn ? (
              <form action={logout}>
                <button
                  type="submit"
                  className="mt-1 w-full rounded-md bg-accent px-3 py-2.5 text-left text-base font-medium text-white"
                >
                  Abmelden
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-1 rounded-md bg-accent px-3 py-2.5 text-base font-medium text-white"
              >
                Anmelden
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
