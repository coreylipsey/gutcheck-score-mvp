import { AssessmentCategory } from '../value-objects/Category';

export interface AIScoringResult {
  score: number;
  explanation: string;
}

export interface AIFeedback {
  keyInsights: string;
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
  nextSteps: string;
}

export interface IAIScoringService {
  scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult>;
  
  generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback>;
} 