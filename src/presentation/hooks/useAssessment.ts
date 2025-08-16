import { useState } from 'react';
import { Container } from '../../infrastructure/di/container';
import { CalculateAssessmentScore } from '../../application/use-cases/CalculateAssessmentScore';
import { SaveAssessmentSession } from '../../application/use-cases/SaveAssessmentSession';
import { GenerateAIFeedback } from '../../application/use-cases/GenerateAIFeedback';
import { AssessmentResponse, AssessmentScores } from '../../domain/entities/Assessment';

export function useAssessment() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateScores = async (responses: AssessmentResponse[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const container = Container.getInstance();
      const calculateScore = container.resolve<CalculateAssessmentScore>('CalculateAssessmentScore');
      
      const scores = await calculateScore.execute(responses);
      return scores;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate scores');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIFeedback = async (request: {
    responses: AssessmentResponse[];
    scores: AssessmentScores;
    industry?: string;
    location?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const container = Container.getInstance();
      const generateFeedbackUseCase = container.resolve<GenerateAIFeedback>('GenerateAIFeedback');
      
      const feedback = await generateFeedbackUseCase.execute(request);
      return feedback;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate AI feedback');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const saveSession = async (request: {
    sessionId: string;
    responses: AssessmentResponse[];
    scores: AssessmentScores;
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
      };
      comprehensiveAnalysis: string;
      nextSteps: string;
    };
      feedback: string;
      strengths: string;
      focusAreas: string;
      nextSteps: string;
    };
    userId?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const container = Container.getInstance();
      const saveSessionUseCase = container.resolve<SaveAssessmentSession>('SaveAssessmentSession');
      
      const sessionId = await saveSessionUseCase.execute(request);
      return sessionId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save session');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    calculateScores,
    generateAIFeedback,
    saveSession,
    isLoading,
    error,
  };
} 