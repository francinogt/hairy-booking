import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Geschuetzte Pfad-Praefixe. ACHTUNG: Dies ist nur ein OPTIMISTISCHER Check auf
// Cookie-Praesenz (schnell, laeuft bei Prefetches). Die echte Absicherung
// (Session-Validierung + Rollen + Ownership) passiert in den Seiten/Actions via DAL.
const PROTECTED_PREFIXES = ["/admin", "/account"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (!needsAuth) return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
