import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const COOKIE_NAME = 'admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin/dashboard routes
  // /admin is the login page and should be accessible
  if (pathname.startsWith('/admin/dashboard')) {
    const sessionCookie = request.cookies.get(COOKIE_NAME);

    if (!sessionCookie?.value) {
      // No session cookie - redirect to login
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Cookie exists - allow request to proceed
    // Full session validation happens in the page/API routes
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
