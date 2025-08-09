import { AssessmentSession } from '../entities/Assessment';

export interface IAssessmentRepository {
  save(session: AssessmentSession): Promise<string>;
  findById(sessionId: string): Promise<AssessmentSession | null>;
  findByUserId(userId: string): Promise<AssessmentSession[]>;
  claimSession(sessionId: string, userId: string): Promise<void>;
  saveOpenEndedScore(
    sessionId: string,
    questionId: string,
    questionText: string,
    response: string,
    aiScore: number,
    aiExplanation: string,
    userId?: string
  ): Promise<string>;
  getSessionOpenEndedScores(sessionId: string): Promise<Record<string, unknown>[]>;
} 