import { NextRequest, NextResponse } from 'next/server';

// Cache the admin path to avoid reading env on every request
const ADMIN_PATH = process.env.ADMIN_PATH || 'a8f3k2j9x7m1n5p';

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json();

    // Simple string comparison - very fast
    const isValid = path === ADMIN_PATH;

    return NextResponse.json({ valid: isValid }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
