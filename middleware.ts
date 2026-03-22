// middleware.ts (ROOT LEVEL)
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  const pathname = request.nextUrl.pathname;
  
  // ✅ FIX 1: Properly identify protected routes
  const protectedPaths = ['/admin', '/dashboard', '/book', '/profile'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));
  const isLoginRoute = pathname === '/'; // Home = login area
  
  // 🔒 No token + Protected route → Home
  if (isProtectedRoute && !token) {
    console.log(`🔒 BLOCKED ${pathname}`);
    return NextResponse.redirect(new URL("/", request.url));
  }
  
  // ✅ Has token + On login (home) → Dashboard
  if (token && isLoginRoute) {
    console.log(`✅ SKIP LOGIN → /dashboard`);
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/book/:path*',
    '/profile/:path*',
    '/'  // Login/home page
  ],
};
