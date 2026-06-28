import Link from "next/link";
import type { Settings } from "@/db/schema";
import type { SessionUser } from "@/lib/auth/dal";
import { isStaff } from "@/lib/auth/roles";
import { logout } from "@/app/actions/auth";
import { MobileNav } from "@/components/mobile-nav";

export type NavLink = { href: string; label: string };

function buildLinks(user: SessionUser | null): NavLink[] {
  const links: NavLink[] = [{ href: "/", label: "Buchen" }];
  if (user) {
    links.push(
      isStaff(user.role)
        ? { href: "/admin", label: "Verwaltung" }
        : { href: "/account", label: "Mein Konto" },
    );
  }
  return links;
}

export function Navbar({ user, settings }: { user: SessionUser | null; settings: Settings }) {
  const links = buildLinks(user);

  return (
    <header className="relative bg-navbar text-navbar-foreground">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg font-semibold">
          {settings.logoPath ? (
            // eslint-disable-next-line @next/next/no-img-element -- Logo ist dynamisch (auch SVG), kein next/image
            <img src={settings.logoPath} alt={settings.companyName} className="h-8 w-auto" />
          ) : null}
          <span>{settings.companyName}</span>
        </Link>

        {/* Desktop-Navigation */}
        <div className="hidden items-center gap-6 sm:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm font-medium hover:opacity-80">
              {l.label}
            </Link>
          ))}
          {user ? (
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
              >
                Abmelden
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
            >
              Anmelden
            </Link>
          )}
        </div>

        {/* Mobile-Navigation */}
        <MobileNav links={links} isLoggedIn={!!user} />
      </nav>
    </header>
  );
}
