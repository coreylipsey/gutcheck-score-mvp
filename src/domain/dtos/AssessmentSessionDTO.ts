import { AssessmentResponse } from '../entities/Assessment';

export interface AssessmentSessionDTO {
  id: string;
  userId?: string;
  sessionId: string;
  responses: AssessmentResponse[];
  scores: {
    overallScore: number;
    personalBackground: number;
    entrepreneurialSkills: number;
    resources: number;
    behavioralMetrics: number;
    growthVision: number;
  };
  starRating: number;
  categoryBreakdown: Record<string, number>;
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
    comprehensiveAnalysis: string;
    nextSteps: string;
  };
  createdAt: Date;
  completedAt: Date;
  isAnonymous: boolean;
}
