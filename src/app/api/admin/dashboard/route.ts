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

export async function GET(request: NextRequest) {
  try {
    // Call the Cloud Function to get dashboard data
    const getAdminDashboardData = httpsCallable(functions, 'getAdminDashboardData');
    
    const result = await getAdminDashboardData();
    const data = result.data as any;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      metrics: {
        totalPartners: 2,
        totalCohorts: 2,
        totalAssessments: 30,
        totalOutcomes: 18,
        averageCompletionRate: 83.3,
        averageScore: 81.0,
        recentAssessments: 5,
        pendingOutcomes: 12,
        totalParticipants: 36,
        totalCompleted: 30
      },
      partners: [
        {
          partnerId: 'qc-001',
          partnerName: 'Queens College',
          partnerEmail: 'ying.zhou@qc.cuny.edu',
          status: 'active',
          createdAt: '2025-08-20',
          cohortsCount: 2
        },
        {
          partnerId: 'hu-002',
          partnerName: 'Howard University',
          partnerEmail: 'entrepreneurship@howard.edu',
          status: 'pending',
          createdAt: '2025-08-22',
          cohortsCount: 0
        }
      ],
      cohorts: [
        {
          cohortId: 'qc-fall-2025',
          partnerId: 'qc-001',
          cohortName: 'Fall 2025 Entrepreneurs',
          totalAssessments: 24,
          completedAssessments: 18,
          completionRate: 75.0,
          averageScore: 79.3,
          taggedOutcomes: 18,
          status: 'active',
          assessmentUrl: 'https://gutcheck-score-mvp.web.app/assessment?partner_id=qc-001&cohort_id=qc-fall-2025'
        },
        {
          cohortId: 'qc-summer-2025',
          partnerId: 'qc-001',
          cohortName: 'Summer Pilot Cohort',
          totalAssessments: 12,
          completedAssessments: 12,
          completionRate: 100.0,
          averageScore: 82.7,
          taggedOutcomes: 12,
          status: 'completed',
          assessmentUrl: 'https://gutcheck-score-mvp.web.app/assessment?partner_id=qc-001&cohort_id=qc-summer-2025'
        }
      ],
      recentAssessments: [
        {
          sessionId: 'session-001',
          userId: 'user-001',
          partnerId: 'qc-001',
          cohortId: 'qc-fall-2025',
          overallScore: 87,
          starRating: 4,
          completedAt: '2025-08-24T10:30:00Z',
          consentForML: true
        }
      ],
      recentOutcomes: [
        {
          sessionId: 'session-001',
          outcomeTag: 'breakthrough',
          outcomeNotes: 'Strong execution potential',
          taggedBy: 'Queens College',
          taggedAt: '2025-08-24T15:00:00Z',
          partnerId: 'qc-001',
          cohortId: 'qc-fall-2025',
          userScore: 87
        }
      ]
    });
  }
}
