import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class GeminiAssessmentService implements IAIScoringService {
  private readonly geminiApiUrl: string;

  constructor() {
    this.geminiApiUrl = process.env.NEXT_PUBLIC_GEMINI_API_URL || 'https://us-central1-gutcheck-score-mvp.cloudfunctions.net';
    
    console.log('Gemini AssessmentService initialized:', {
      geminiApiUrl: this.geminiApiUrl
    });
  }

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult> {
    try {
      console.log(`Scoring open-ended question ${questionId} with Gemini API`);
      
      // Map question ID to question type for the Gemini API
      const questionType = this.getQuestionType(questionId);
      
      const apiResponse = await fetch(`${this.geminiApiUrl}/scoreQuestion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionType: questionType,
          response: response
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Gemini API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      return {
        score: result.score,
        explanation: result.explanation
      };
    } catch (error) {
      console.error('Gemini API scoring error:', error);
      // Re-throw the error to make API failures immediately visible
      throw error;
    }
  }

  async generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    try {
      console.log('Gemini AssessmentService.generateFeedback called:', {
        responsesCount: responses.length,
        scores,
        industry,
        location
      });

      const apiResponse = await fetch(`${this.geminiApiUrl}/generateFeedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: responses,
          scores: scores,
          industry: industry || 'General',
          location: location || 'Unknown'
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Gemini API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      return {
        feedback: result.feedback || '',
        competitiveAdvantage: result.competitiveAdvantage || {
          category: '',
          score: '',
          summary: '',
          specificStrengths: []
        },
        growthOpportunity: result.growthOpportunity || {
          category: '',
          score: '',
          summary: '',
          specificWeaknesses: []
        },
        scoreProjection: result.scoreProjection || {
          currentScore: 0,
          projectedScore: 0,
          improvementPotential: 0
        },
        comprehensiveAnalysis: result.comprehensiveAnalysis || '',
        nextSteps: result.nextSteps || ''
      };
    } catch (error) {
      console.error('Gemini API feedback generation error:', error);
      // Re-throw the error to make API failures immediately visible
      throw error;
    }
  }

  private getQuestionType(questionId: string): string {
    // Map question IDs to their types for the Gemini API
    const questionTypeMap: Record<string, string> = {
      'q3': 'entrepreneurialJourney',
      'q8': 'businessChallenge', 
      'q18': 'setbacksResilience',
      'q23': 'finalVision'
    };
    
    return questionTypeMap[questionId] || 'entrepreneurialJourney';
  }
}
