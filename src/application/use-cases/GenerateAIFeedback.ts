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
  nextSteps: string;
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
      // Generate basic feedback based on scores when AI is unavailable
      const topCategory = Object.entries(request.scores).reduce((a, b) => 
        request.scores[a[0] as keyof typeof request.scores] > request.scores[b[0] as keyof typeof request.scores] ? a : b
      )[0];
      
      const focusCategory = Object.entries(request.scores).reduce((a, b) => 
        request.scores[a[0] as keyof typeof request.scores] < request.scores[b[0] as keyof typeof request.scores] ? a : b
      )[0];
      
      const overallScore = Math.round(Object.values(request.scores).reduce((a, b) => a + b, 0));
      
      return {
        feedback: `Based on your assessment, you scored ${overallScore} out of 100. Your strongest area is ${topCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}, while ${focusCategory.replace(/([A-Z])/g, ' $1').toLowerCase()} could use more attention.`,
        competitiveAdvantage: {
          category: topCategory.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          score: `${request.scores[topCategory as keyof typeof request.scores]}/${getCategoryMax(topCategory)}`,
          summary: `Your ${topCategory.replace(/([A-Z])/g, ' $1').toLowerCase()} shows strong potential for growth.`,
          specificStrengths: [
            "Strong foundation in business fundamentals",
            "Demonstrated problem-solving abilities",
            "Commitment to continuous learning",
            "Resilient approach to challenges"
          ]
        },
        growthOpportunity: {
          category: focusCategory.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
          score: `${request.scores[focusCategory as keyof typeof request.scores]}/${getCategoryMax(focusCategory)}`,
          summary: `There are opportunities to strengthen your ${focusCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
          specificWeaknesses: [
            "Goal tracking could be more systematic",
            "Time management needs more structure",
            "Business planning processes could be formalized",
            "Strategic thinking could be enhanced"
          ]
        },
        scoreProjection: {
          currentScore: overallScore,
          projectedScore: Math.min(100, overallScore + 3),
          improvementPotential: 3
        },
        nextSteps: "Consider seeking mentorship, exploring funding options, and building your entrepreneurial fundamentals."
      };
    }
  }
} 