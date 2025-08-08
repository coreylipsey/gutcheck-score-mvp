import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // Get the session document
    const sessionRef = doc(db, 'assessmentSessions', sessionId);
    const sessionDoc = await getDoc(sessionRef);

    if (!sessionDoc.exists()) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const sessionData = sessionDoc.data();

    // Check if the session is already linked to a user
    if (sessionData.userId && sessionData.userId !== userId) {
      return NextResponse.json(
        { error: 'Session already linked to another user' },
        { status: 409 }
      );
    }

    // Update the session to link it to the user
    await updateDoc(sessionRef, {
      userId: userId,
      isAnonymous: false,
      claimedAt: new Date(),
    });

    return NextResponse.json(
      { success: true, message: 'Score claimed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error claiming score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 