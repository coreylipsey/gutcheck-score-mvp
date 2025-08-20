/**
 * ADK Assessment Service
 * Integrates Google ADK Core Assessment Agent with existing Clean Architecture
 */

import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class ADKAssessmentService implements IAIScoringService {
  private readonly adkServerUrl: string;
  private readonly useADK: boolean;

  constructor() {
    // Use environment variable or default to local ADK server
    this.adkServerUrl = process.env.NEXT_PUBLIC_ADK_SERVER_URL || 'http://localhost:8000';
    
    // A/B testing flag - defaults to true (use ADK) if not specified
    this.useADK = process.env.USE_ADK !== 'false';
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
        explanation: data.explanation || ''
      };
    } catch (error) {
      console.error('ADK scoring error:', error);
      // Fallback to default score
      return {
        score: 3,
        explanation: ''
      };
    }
  }

  async generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    // A/B testing: Check if we should use ADK or legacy system
    if (!this.useADK) {
      console.log('ADK AssessmentService: Using legacy system (USE_ADK=false)');
      return this.generateLegacyFeedback(responses, scores, industry, location);
    }

    try {
      // Use the new coordinated request endpoint for enhanced functionality
      const apiResponse = await fetch(`${this.adkServerUrl}/coordinated-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_type: 'assessment_feedback',
          task_data: {
            responses,
            scores,
            industry,
            location
          }
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`ADK API error: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      
      // Debug logging
      console.log('ADK AssessmentService received coordinated data:', {
        coordinator_status: data.coordinator_status,
        delegated_agent: data.delegated_agent,
        safety_info: data.safety_info ? 'present' : 'missing',
        result: data.result ? 'present' : 'missing'
      });
      
      // Extract the result from the coordinated response
      const result = data.result || {};
      
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
      console.error('ADK feedback generation error:', error);
      // Fallback to legacy system if ADK fails
      console.log('ADK AssessmentService: Falling back to legacy system due to error');
      return this.generateLegacyFeedback(responses, scores, industry, location);
    }
  }

  private async generateLegacyFeedback(
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
        throw new Error(`Legacy ADK API error: ${apiResponse.statusText}`);
      }

      const data = await apiResponse.json();
      
      return {
        feedback: data.feedback || '',
        competitiveAdvantage: data.competitiveAdvantage || {
          category: '',
          score: '',
          summary: '',
          specificStrengths: []
        },
        growthOpportunity: data.growthOpportunity || {
          category: '',
          score: '',
          summary: '',
          specificWeaknesses: []
        },
        scoreProjection: data.scoreProjection || {
          currentScore: 0,
          projectedScore: 0,
          improvementPotential: 0
        },
        comprehensiveAnalysis: data.comprehensiveAnalysis || '',
        nextSteps: data.nextSteps || ''
      };
    } catch (error) {
      console.error('Legacy feedback generation error:', error);
      // Return empty feedback - no fallback text
      return {
        feedback: '',
        competitiveAdvantage: {
          category: '',
          score: '',
          summary: '',
          specificStrengths: []
        },
        growthOpportunity: {
          category: '',
          score: '',
          summary: '',
          specificWeaknesses: []
        },
        scoreProjection: {
          currentScore: 0,
          projectedScore: 0,
          improvementPotential: 0
        },
        comprehensiveAnalysis: '',
        nextSteps: ''
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
