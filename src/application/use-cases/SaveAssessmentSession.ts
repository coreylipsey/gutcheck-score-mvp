import { AssessmentSession, AssessmentScores, AssessmentResponse } from '../../domain/entities/Assessment';
import { IAssessmentRepository } from '../../domain/repositories/IAssessmentRepository';

export interface SaveAssessmentSessionRequest {
  sessionId: string;
  responses: AssessmentResponse[];
  scores: AssessmentScores;
  starRating: number;
  categoryBreakdown: Record<string, number>;
  consentForML: boolean;
  geminiFeedback?: {
    feedback: string;
    competitiveAdvantage: {
      category: string;
      score: string;
      summary: string;
      specificStrengths: string[];
    };
    growthOpportunity: {
      category: string;
      score: string;
      summary: string;
      specificWeaknesses: string[];
    };
    scoreProjection: {
      currentScore: number;
      projectedScore: number;
      improvementPotential: number;
      analysis?: {
        lowestCategory: string;
        currentCategoryScore: number;
        realisticImprovements: Array<{
          questionId: string;
          currentResponse: string;
          currentScore: number;
          suggestedImprovement: string;
          potentialScore: number;
          pointGain: number;
          reasoning: string;
        }>;
        totalPointGain: number;
      };
    };
    comprehensiveAnalysis: {
      signalReadout: string;
      strengthSignals: string;
      developmentAreas: string;
      trajectoryIndicators: string;
    };
    nextSteps: {
      mentorship: {
        title: string;
        description: string;
        url: string;
      };
      funding: {
        title: string;
        description: string;
        url: string;
      };
      learning: {
        title: string;
        description: string;
        url: string;
      };
    };
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
      starRating: request.starRating,
      categoryBreakdown: request.categoryBreakdown,
      geminiFeedback: request.geminiFeedback,
      outcomeTrackingReady: true,
      consentForML: request.consentForML,
    };

    return await this.assessmentRepository.save(session);
  }
} 