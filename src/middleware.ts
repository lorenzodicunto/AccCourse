import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

/**
 * Edge middleware — uses the lightweight auth config (no DB/prisma imports).
 * Only reads JWT tokens to check authentication status.
 */
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const role = req.auth?.user?.role;

  // Public routes: /review/*, /login, /api/auth/*, /api/health
  if (
    pathname.startsWith("/review") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health")
  ) {
    // If logged in and trying to access /login, redirect to dashboard
    if (pathname.startsWith("/login") && isLoggedIn) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
    return NextResponse.next();
  }

  // Protected: require authentication
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  // Admin route: require SUPER_ADMIN
  if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
