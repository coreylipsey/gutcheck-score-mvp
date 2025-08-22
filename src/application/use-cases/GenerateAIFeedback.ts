import { AssessmentResponse } from '../../domain/entities/Assessment';
import { AssessmentCategory } from '../../domain/value-objects/Category';
import { IAIScoringService } from '../../domain/repositories/IAIScoringService';

// Helper function to get category max scores
function getCategoryMax(category: string): number {
  const categoryMaxScores: Record<string, number> = {
    personalBackground: 20,
    entrepreneurialSkills: 25,
    resources: 20,
    behavioralMetrics: 15,
    growthVision: 20,
  };
  return categoryMaxScores[category] || 20;
}

export interface GenerateAIFeedbackRequest {
  responses: AssessmentResponse[];
  scores: Record<AssessmentCategory, number>;
  industry?: string;
  location?: string;
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
}

export class GenerateAIFeedback {
  constructor(private readonly aiService: IAIScoringService) {}

  async execute(request: GenerateAIFeedbackRequest): Promise<AIFeedback> {
    try {
      const feedback = await this.aiService.generateFeedback(
        request.responses.map(r => ({
          questionId: r.questionId,
          response: r.response,
          category: r.category,
        })),
        request.scores,
        request.industry,
        request.location
      );
      return feedback;
    } catch (error) {
      console.error('AI feedback generation failed:', error);
      // Return empty feedback when AI is unavailable - NO FALLBACK DATA
      throw new Error('AI feedback generation failed. Please try again later.');
    }
  }
} 