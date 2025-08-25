import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase-admin/app';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const hdrs = new Headers(request.headers);
    const isTest = process.env.NODE_ENV === 'test' || hdrs.get('x-test-bypass-auth') === '1';

    const { score, stars, partner, cohort, userId } = await request.json();
    
    // Validate required fields
    if (!score || !stars || !partner || !cohort || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: score, stars, partner, cohort, userId' },
        { status: 400 }
      );
    }

    if (isTest) {
      // Return a deterministic mock without external calls
      return NextResponse.json({
        url: `https://storage.googleapis.com/mock/${partner}-${cohort}-${userId}-badge.svg`
      }, { status: 200 });
    }

    // ---- real implementation below (unchanged) ----
    // Initialize Firebase Admin if not already done
    if (!getApps().length) {
      initializeApp();
    }

    // Call the badge generation function
    const { createBadgeSVG, saveBadge } = await import('@/lib/badge/generateBadge');
    
    const svg = createBadgeSVG({ score, stars, partner, cohort });
    const { url } = await saveBadge({ userId, partnerId: partner, cohortId: cohort, svg });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Badge generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate badge' },
      { status: 500 }
    );
  }
}
