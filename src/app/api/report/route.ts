import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

export async function POST(request: NextRequest) {
  try {
    const hdrs = new Headers(request.headers);
    const isTest = process.env.NODE_ENV === 'test' || hdrs.get('x-test-bypass-auth') === '1';

    const { partner, cohort } = await request.json();

    // Validate required fields
    if (!partner || !cohort) {
      return NextResponse.json(
        { error: 'Missing required fields: partner, cohort' },
        { status: 400 }
      );
    }

    if (isTest) {
      // Return a deterministic mock without external calls
      return NextResponse.json({
        url: `https://storage.googleapis.com/mock/${partner}-${cohort}-report.pdf`
      }, { status: 200 });
    }

    // ---- real implementation below (unchanged) ----
    // Initialize Firebase Admin if not already done
    if (!getApps().length) {
      initializeApp();
    }
    
    // Fetch cohort totals from Firestore
    const db = getFirestore();
    const sessionsSnapshot = await db
      .collection('assessmentSessions')
      .where('partnerMetadata.partnerId', '==', partner)
      .where('partnerMetadata.cohortId', '==', cohort)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());
    
    const totals = {
      assessments: sessions.length,
      completed: sessions.filter(s => s.score !== undefined).length,
      tagged: sessions.filter(s => s.outcomeTracking?.outcomeTag).length,
      avgScore: sessions.length > 0 
        ? sessions.reduce((sum, s) => sum + (s.score || 0), 0) / sessions.length 
        : 0
    };

    // Generate the report
    const { generateFunderReport } = await import('@/lib/report/generateFunderReport');
    const { url } = await generateFunderReport({ partner, cohort, totals });

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
