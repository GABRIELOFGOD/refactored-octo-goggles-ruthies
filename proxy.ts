import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

// Define protected routes
const adminRoutes = ['/admin'];
const authProtectedRoutes = ['/account', '/orders', '/wishlist', '/checkout'];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if route is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if route is auth protected
  const isAuthProtected = authProtectedRoutes.some((route) => pathname.startsWith(route));

  // Middleware doesn't need to check auth for all routes
  // Route handlers will check auth via getServerSession
  // This middleware is kept minimal for performance

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
