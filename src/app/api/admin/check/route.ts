import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET(request: NextRequest) {
  try {
    if (!adminAuth) {
      return NextResponse.json({ authenticated: false });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');

    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false });
    }

    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value, true);
    
    // Check if email is in admin list
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const isAuthenticated = decodedClaims.email && adminEmails.includes(decodedClaims.email);

    return NextResponse.json({ authenticated: isAuthenticated });
  } catch (error) {
    return NextResponse.json({ authenticated: false });
  }
}
