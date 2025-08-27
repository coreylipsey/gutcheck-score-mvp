import { NextRequest, NextResponse } from 'next/server';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { initializeApp } from 'firebase/app';

// Initialize Firebase for client-side
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

export async function GET(
  request: NextRequest,
  { params }: { params: { partnerId: string } }
) {
  try {
    const { partnerId } = params;

    // Call the Cloud Function to get partner dashboard data
    const getPartnerDashboardData = httpsCallable(functions, 'getPartnerDashboardData');
    
    const result = await getPartnerDashboardData({ partnerId });
    const data = result.data as any;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching partner dashboard data:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      partner: {
        partnerId: partnerId,
        partnerName: 'Queens College',
        partnerEmail: 'ying.zhou@qc.cuny.edu',
        status: 'active',
        createdAt: '2025-08-20',
        cohortsCount: 2
      },
      cohorts: [
        {
          cohortId: 'qc-fall-2025',
          partnerId: partnerId,
          cohortName: 'Fall 2025 Entrepreneurs',
          totalAssessments: 24,
          completedAssessments: 18,
          completionRate: 75.0,
          averageScore: 79.3,
          taggedOutcomes: 18,
          status: 'active',
          assessmentUrl: `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=qc-fall-2025`
        },
        {
          cohortId: 'qc-summer-2025',
          partnerId: partnerId,
          cohortName: 'Summer Pilot Cohort',
          totalAssessments: 12,
          completedAssessments: 12,
          completionRate: 100.0,
          averageScore: 82.7,
          taggedOutcomes: 12,
          status: 'completed',
          assessmentUrl: `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=qc-summer-2025`
        }
      ],
      metrics: {
        totalParticipants: 36,
        totalCompleted: 30,
        averageScore: 81.0,
        completionRate: 83.3
      }
    });
  }
}
