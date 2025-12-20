import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

const VIEW_COUNT_DOC_PATH = "portfolio/stats";

/**
 * Increment the view count
 * This is a server-side API route to prevent client-side manipulation
 */
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: 'Firebase Admin not initialized' },
        { status: 500 }
      );
    }

    // Get client IP for basic rate limiting (optional)
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Increment view count using Firestore
    const docRef = adminDb.doc(VIEW_COUNT_DOC_PATH);
    const docSnap = await docRef.get();

    if (docSnap.exists()) {
      // Document exists, increment
      await docRef.update({
        totalViews: FieldValue.increment(1),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      // Document doesn't exist, create with 1
      await docRef.set({
        totalViews: 1,
        lastUpdated: new Date().toISOString(),
      });
    }

    // Get updated count
    const updatedSnap = await docRef.get();
    const updatedData = updatedSnap.data();
    const newCount = updatedData?.totalViews || 0;

    console.log(`[view-count] Incremented view count. New count: ${newCount}, IP: ${clientIp}`);

    return NextResponse.json({ 
      success: true, 
      viewCount: newCount 
    });
  } catch (error) {
    console.error('[view-count] Error incrementing view count:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to increment view count';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
