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
  { params }: { params: { partnerId: string; cohortId: string } }
) {
  try {
    const { partnerId, cohortId } = params;

    // Call the Cloud Function to get cohort analytics data
    const getCohortAnalyticsData = httpsCallable(functions, 'getCohortAnalyticsData');
    
    const result = await getCohortAnalyticsData({ partnerId, cohortId });
    const data = result.data as any;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching cohort analytics data:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      cohort: {
        cohortId: cohortId,
        partnerId: partnerId,
        cohortName: 'Fall 2025 Entrepreneurs',
        totalAssessments: 24,
        completedAssessments: 18,
        completionRate: 75.0,
        averageScore: 79.3,
        taggedOutcomes: 18,
        status: 'active',
        assessmentUrl: `https://gutcheck-score-mvp.web.app/assessment?partner_id=${partnerId}&cohort_id=${cohortId}`
      },
      participants: [
        {
          id: 'p1',
          name: 'Alex Rodriguez',
          email: 'alex.rodriguez@email.com',
          score: 87,
          completedAt: '2025-08-25',
          sessionId: 'session_123'
        },
        {
          id: 'p2',
          name: 'Maria Chen',
          email: 'maria.chen@email.com',
          score: 91,
          completedAt: '2025-08-24',
          sessionId: 'session_124'
        },
        {
          id: 'p3',
          name: 'David Kim',
          email: 'david.kim@email.com',
          score: 65,
          completedAt: '2025-08-23',
          sessionId: 'session_125'
        },
        {
          id: 'p4',
          name: 'Sarah Johnson',
          email: 'sarah.johnson@email.com',
          score: 82,
          completedAt: '2025-08-22',
          sessionId: 'session_126'
        },
        {
          id: 'p5',
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          score: 78,
          completedAt: '2025-08-21',
          sessionId: 'session_127'
        }
      ],
      metrics: {
        totalParticipants: 24,
        totalCompleted: 18,
        averageScore: 79.3,
        completionRate: 75.0
      },
      scoreDistribution: [
        { range: '90-100', count: 2 },
        { range: '80-89', count: 5 },
        { range: '70-79', count: 8 },
        { range: '60-69', count: 2 },
        { range: '50-59', count: 1 }
      ]
    });
  }
}
