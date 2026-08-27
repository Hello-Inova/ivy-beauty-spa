import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";

/**
 * Optimistic auth check for /admin/*. This only checks whether a session
 * cookie is PRESENT (fast, Proxy-friendly) — it does not verify the JWT
 * signature. The authoritative check lives in `app/admin/layout.tsx`
 * (a Server Component running in the Node.js runtime), per Next.js'
 * recommended "optimistic checks in Proxy + authoritative check in the data
 * access layer" pattern. This file has no effect on the static demo export
 * (it is excluded from that build — see scripts/build-demo.sh) since the
 * demo's /admin uses a purely client-side localStorage session instead.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    const hasSession = request.cookies.has(SESSION_COOKIE);
    if (!hasSession) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
