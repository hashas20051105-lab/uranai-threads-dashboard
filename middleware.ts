import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/auth/admin-session";

const protectedPages = [
  "/dashboard",
  "/buzz",
  "/import",
  "/ideas",
  "/reservations",
  "/schedule",
  "/insights",
  "/reports",
  "/experiments",
  "/settings",
  "/brand",
  "/calendar",
  "/cta"
];

const protectedApiPrefixes = [
  "/api/dashboard",
  "/api/ideas",
  "/api/buzz",
  "/api/threads",
  "/api/reservations",
  "/api/insights",
  "/api/reports",
  "/api/settings"
];

const publicPrefixes = ["/login", "/api/auth", "/api/health"];
const cronProtectedPrefixes = ["/api/cron"];
const cronProtectedPaths = ["/api/reservations/publish-due", "/api/insights/collect"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAsset(pathname) || startsWithAny(pathname, publicPrefixes)) {
    return NextResponse.next();
  }

  const isAuthenticated = await verifyAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE)?.value);

  if (pathname === "/" && isAuthenticated) {
    return NextResponse.next();
  }

  if (isCronProtected(pathname) && hasValidCronSecret(request)) {
    return NextResponse.next();
  }

  if (startsWithAny(pathname, protectedApiPrefixes) || isCronProtected(pathname)) {
    if (!isAuthenticated) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (startsWithAny(pathname, protectedPages) && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

function isStaticAsset(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    /\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|map|txt)$/.test(pathname)
  );
}

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isCronProtected(pathname: string) {
  return startsWithAny(pathname, cronProtectedPrefixes) || cronProtectedPaths.includes(pathname);
}

function hasValidCronSecret(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authorization = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const headerSecret = request.headers.get("x-cron-secret");
  return authorization === secret || headerSecret === secret;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
