/**
 * ADK Assessment Service
 * Integrates Google ADK Core Assessment Agent with existing Clean Architecture
 */

import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class ADKAssessmentService implements IAIScoringService {
  private readonly adkServerUrl: string;

  constructor() {
    // Use environment variable or default to local ADK server
    this.adkServerUrl = process.env.NEXT_PUBLIC_ADK_SERVER_URL || 'http://localhost:8000';
  }

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult> {
    try {
      const apiResponse = await fetch(`${this.adkServerUrl}/score-question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId,
          response,
          questionText
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`ADK API error: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      return {
        score: data.score || 3,
        explanation: data.explanation || 'ADK agent evaluation completed'
      };
    } catch (error) {
      console.error('ADK scoring error:', error);
      // Fallback to default score
      return {
        score: 3,
        explanation: 'ADK agent temporarily unavailable, using default score'
      };
    }
  }

  async generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    try {
      const apiResponse = await fetch(`${this.adkServerUrl}/generate-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses,
          scores,
          industry,
          location
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`ADK API error: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      
      // Debug logging
      console.log('ADK AssessmentService received data:', {
        feedback: data.feedback ? 'present' : 'missing',
        competitiveAdvantage: data.competitiveAdvantage ? 'present' : 'missing',
        growthOpportunity: data.growthOpportunity ? 'present' : 'missing',
        comprehensiveAnalysis: data.comprehensiveAnalysis ? 'present' : 'missing',
        nextSteps: data.nextSteps ? 'present' : 'missing'
      });
      
      if (data.comprehensiveAnalysis) {
        console.log('ADK Comprehensive Analysis received, length:', data.comprehensiveAnalysis.length);
      }
      
      return {
        feedback: data.feedback,
        competitiveAdvantage: data.competitiveAdvantage,
        growthOpportunity: data.growthOpportunity,
        scoreProjection: data.scoreProjection || 'Score projection not available',
        comprehensiveAnalysis: data.comprehensiveAnalysis,
        nextSteps: data.nextSteps
      };
    } catch (error) {
      console.error('ADK feedback generation error:', error);
      // Return fallback feedback
      return {
        feedback: 'ADK agent temporarily unavailable',
        competitiveAdvantage: 'Your competitive advantages will be identified based on your assessment scores.',
        growthOpportunity: 'Your growth opportunities will be determined from your assessment results.',
        scoreProjection: 'Score projection not available',
        comprehensiveAnalysis: 'Comprehensive analysis is temporarily unavailable.',
        nextSteps: 'Consider seeking mentorship, exploring funding options, and building your entrepreneurial fundamentals.'
      };
    }
  }

  async checkADKServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.adkServerUrl}/`);
      return response.ok;
    } catch (error) {
      console.error('ADK server health check failed:', error);
      return false;
    }
  }

  async getAgentInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.adkServerUrl}/agent-info`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to get ADK agent info:', error);
      return null;
    }
  }
}
