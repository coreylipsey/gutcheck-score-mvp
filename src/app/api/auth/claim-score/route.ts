import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@/infrastructure/di/container';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, userId } = await request.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'Session ID and User ID are required' },
        { status: 400 }
      );
    }

    // Use Clean Architecture - get repository from DI container
    const assessmentRepository = Container.getInstance().resolve<IAssessmentRepository>('IAssessmentRepository');
    
    // Get the session
    const session = await assessmentRepository.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if the session is already linked to a user
    if (session.userId && session.userId !== userId) {
      return NextResponse.json(
        { error: 'Session already linked to another user' },
        { status: 409 }
      );
    }

    // Update the session to link it to the user
    // Note: This would require adding a claimSession method to the repository
    // For now, we'll need to implement this in the repository layer
    await assessmentRepository.claimSession(sessionId, userId);

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