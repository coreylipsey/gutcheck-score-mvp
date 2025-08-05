import { AssessmentSession, AssessmentScores, AssessmentResponse } from '../../domain/entities/Assessment';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';

export interface SaveAssessmentSessionRequest {
  sessionId: string;
  responses: AssessmentResponse[];
  scores: AssessmentScores;
  starRating: number;
  categoryBreakdown: Record<string, number>;
  geminiFeedback?: {
    feedback: string;
    strengths: string;
    focusAreas: string;
    nextSteps: string;
  };
  userId?: string;
}

export class SaveAssessmentSession {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(request: SaveAssessmentSessionRequest): Promise<string> {
    const session: AssessmentSession = {
      sessionId: request.sessionId,
      userId: request.userId,
      createdAt: new Date(),
      completedAt: new Date(),
      responses: request.responses,
      scores: request.scores,
      geminiFeedback: request.geminiFeedback,
      outcomeTrackingReady: true,
      consentForML: true,
    };

    return await this.assessmentRepository.save(session);
  }
} 