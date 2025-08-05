import { AssessmentCategory } from '../value-objects/Category';

export interface AIScoringResult {
  score: number;
  explanation: string;
}

export interface AIFeedback {
  feedback: string;
  strengths: string;
  focusAreas: string;
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