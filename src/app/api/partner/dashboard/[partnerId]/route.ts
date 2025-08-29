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
    console.log('API: Fetching partner dashboard data for partnerId:', partnerId);

    // Call the Cloud Function to get partner dashboard data
    const getPartnerDashboardData = httpsCallable(functions, 'getPartnerDashboardData');
    
    console.log('API: Calling Cloud Function getPartnerDashboardData');
    const result = await getPartnerDashboardData({ partnerId });
    console.log('API: Cloud Function result:', result);
    
    const data = result.data as any;
    console.log('API: Returning data:', data);

    return NextResponse.json(data);
  } catch (error) {
    console.error('API: Error fetching partner dashboard data:', error);
    
    // Return detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : '';
    
    console.error('API: Error details:', { errorMessage, errorStack });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch partner dashboard data',
        details: errorMessage,
        partnerId: params.partnerId
      },
      { status: 500 }
    );
  }
}
