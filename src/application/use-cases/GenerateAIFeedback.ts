import { AssessmentResponse } from '../../domain/entities/Assessment';
import { AssessmentCategory } from '../../domain/value-objects/Category';
import { IAIScoringService } from '../../domain/repositories/IAIScoringService';

export interface GenerateAIFeedbackRequest {
  responses: AssessmentResponse[];
  scores: Record<AssessmentCategory, number>;
  industry?: string;
  location?: string;
}

export interface AIFeedback {
  feedback: string;
  strengths: string;
  focusAreas: string;
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
      
      return {
        feedback: `Based on your assessment, you scored ${Math.round(Object.values(request.scores).reduce((a, b) => a + b, 0))} out of 100. Your strongest area is ${topCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}, while ${focusCategory.replace(/([A-Z])/g, ' $1').toLowerCase()} could use more attention.`,
        strengths: `Your top strength is in ${topCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}, where you scored ${request.scores[topCategory as keyof typeof request.scores]}.`,
        focusAreas: `Your priority focus area is ${focusCategory.replace(/([A-Z])/g, ' $1').toLowerCase()}, where you scored ${request.scores[focusCategory as keyof typeof request.scores]}.`,
        nextSteps: "Consider seeking mentorship, exploring funding options, and building your entrepreneurial fundamentals."
      };
    }
  }
} 