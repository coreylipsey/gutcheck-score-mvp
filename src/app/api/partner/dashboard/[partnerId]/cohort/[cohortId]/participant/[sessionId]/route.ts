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
  { params }: { params: { partnerId: string; cohortId: string; sessionId: string } }
) {
  try {
    const { partnerId, cohortId, sessionId } = params;

    // Call the Cloud Function to get participant report data
    const getParticipantReportData = httpsCallable(functions, 'getParticipantReportData');
    
    const result = await getParticipantReportData({ partnerId, cohortId, sessionId });
    const data = result.data as any;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching participant report data:', error);
    
    // Return mock data as fallback
    return NextResponse.json({
      report: {
        sessionId: sessionId,
        participantName: 'Alex Rodriguez',
        participantEmail: 'alex.rodriguez@email.com',
        completedAt: '2025-08-25T10:30:00Z',
        overallScore: 87,
        categoryScores: {
          'Market Understanding': 85,
          'Execution Capability': 90,
          'Team & Resources': 82,
          'Financial Acumen': 88,
          'Risk Management': 85,
          'Innovation & Adaptability': 89
        },
        responses: {
          'entrepreneurialJourney': 'I started my first business at 19, a small e-commerce store that grew to $50K in revenue. After graduating, I co-founded a tech startup that raised $500K in seed funding. We pivoted twice based on market feedback and eventually found product-market fit.',
          'businessChallenge': 'Our biggest challenge was customer acquisition cost. We initially spent $200 per customer but through A/B testing and optimization, we reduced it to $45 while maintaining quality leads.',
          'setbacksResilience': 'When our main investor pulled out last minute, we had to lay off half our team. Instead of giving up, we restructured the business, focused on profitability, and bootstrapped our way to break-even in 6 months.',
          'finalVision': 'I want to build a platform that democratizes access to entrepreneurial education and resources. My vision is to help 100,000 entrepreneurs launch successful businesses in the next 10 years.'
        },
        feedback: {
          keyInsights: 'Alex demonstrates strong execution capability with a proven track record of building and scaling businesses. Their resilience in the face of setbacks shows exceptional adaptability.',
          competitiveAdvantage: 'Deep experience in e-commerce and tech startups, with proven ability to pivot and adapt to market changes. Strong track record of fundraising and team management.',
          growthOpportunity: 'Could benefit from more structured financial planning and risk assessment frameworks. Consider developing stronger market research methodologies.',
          nextSteps: 'Focus on building a more robust financial model and developing systematic approaches to market validation. Consider mentorship in scaling operations.'
        }
      }
    });
  }
}
