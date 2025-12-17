import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ADMIN_PATH = process.env.ADMIN_PATH || 'a8f3k2j9x7m1n5p';

  // Check if the request is for the admin route
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    
    // Check if this segment matches our admin path
    const looksLikeAdmin = firstSegment.length > 10 || firstSegment === ADMIN_PATH;
    
    if (looksLikeAdmin || pathname.includes('/login')) {
      // Check for admin session cookie
      const sessionCookie = request.cookies.get('admin_session');
      
      // Basic check - full verification happens in API route
      // If no cookie and not on login, redirect to login
      if (!sessionCookie && !pathname.includes('/login')) {
        const loginUrl = new URL(`/${firstSegment}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }

      // If has cookie and on login page, redirect to dashboard
      if (sessionCookie && pathname.includes('/login')) {
        const dashboardUrl = new URL(`/${firstSegment}`, request.url);
        return NextResponse.redirect(dashboardUrl);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|pdf)$).*)',
  ],
};
