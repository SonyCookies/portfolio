import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ADMIN_PATH = process.env.ADMIN_PATH || 'a8f3k2j9x7m1n5p';

  // Check if the request is for the admin route
  const pathSegments = pathname.split('/').filter(Boolean);
  
  if (pathSegments.length > 0) {
    const firstSegment = pathSegments[0];
    
    // Check if this segment matches our admin path (exact match or long random string)
    const isAdminPath = firstSegment === ADMIN_PATH || (firstSegment.length > 10 && firstSegment.match(/^[a-z0-9]+$/i));
    
    if (isAdminPath) {
      // Check for admin session cookie
      const sessionCookie = request.cookies.get('admin_session');
      
      // If accessing login page
      if (pathname.includes('/login')) {
        // If has valid session cookie, redirect to dashboard
        if (sessionCookie) {
          const dashboardUrl = new URL(`/${firstSegment}`, request.url);
          return NextResponse.redirect(dashboardUrl);
        }
        // If no cookie, allow access to login page
        return NextResponse.next();
      }
      
      // If not on login page, require authentication
      if (!sessionCookie) {
        // No session cookie - redirect to login
        const loginUrl = new URL(`/${firstSegment}/login`, request.url);
        return NextResponse.redirect(loginUrl);
      }
      
      // Has session cookie - allow access (full verification happens in API route)
      return NextResponse.next();
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

