/**
 * ADK Assessment Service
 * Integrates Google ADK Core Assessment Agent with existing Clean Architecture
 */

import { IAIScoringService, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class ADKAssessmentService implements IAIScoringService {
  private adkAgentUrl: string;

  constructor() {
    // ADK agent will be deployed and accessible via this URL
    this.adkAgentUrl = process.env.ADK_AGENT_URL || 'http://localhost:8000';
  }

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<{ score: number; explanation: string }> {
    // Use ADK agent for question scoring
    const adkResponse = await fetch(`${this.adkAgentUrl}/score-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionId,
        questionText,
        response
      })
    });

    if (!adkResponse.ok) {
      throw new Error(`ADK agent error: ${adkResponse.statusText}`);
    }

    const data = await adkResponse.json();
    return {
      score: data.score || 3,
      explanation: data.explanation || 'AI evaluation completed'
    };
  }

  async generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    try {
      // Prepare assessment data for ADK agent
      const assessmentData = {
        responses: responses.map(r => ({
          questionId: r.questionId,
          questionText: r.questionText,
          response: r.response,
          category: r.category
        })),
        scores: {
          personalBackground: scores.personalBackground,
          entrepreneurialSkills: scores.entrepreneurialSkills,
          resources: scores.resources,
          behavioralMetrics: scores.behavioralMetrics,
          growthVision: scores.growthVision
        },
        industry,
        location
      };

      // Call ADK agent for comprehensive feedback generation
      const adkResponse = await fetch(`${this.adkAgentUrl}/generate-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assessmentData)
      });

      if (!adkResponse.ok) {
        throw new Error(`ADK agent error: ${adkResponse.statusText}`);
      }

      const adkData = await adkResponse.json();
      
      // Transform ADK response to match existing AIFeedback interface
      return {
        feedback: adkData.feedback || 'AI feedback generation completed.',
        competitiveAdvantage: adkData.competitiveAdvantage || {
          category: 'Unknown',
          score: '0/0',
          summary: 'Your competitive advantages will be identified based on your assessment scores.',
          specificStrengths: [
            'Business experience (previous attempts show learning mindset)',
            'Network connections (leveraged support systems effectively)',
            'Learning commitment (regular professional development activities)',
            'Adaptability (successfully navigated business challenges)'
          ]
        },
        growthOpportunity: adkData.growthOpportunity || {
          category: 'Unknown',
          score: '0/0',
          summary: 'Your growth opportunities will be determined from your assessment results.',
          specificWeaknesses: [
            'Goal tracking frequency (currently "occasionally" vs weekly)',
            'Time allocation (varies without consistent structure)',
            'Planning processes (informal vs documented approach)',
            'Strategic execution (reactive vs proactive planning)'
          ]
        },
        scoreProjection: adkData.scoreProjection || {
          currentScore: Object.values(scores).reduce((sum, score) => sum + score, 0),
          projectedScore: 0,
          improvementPotential: 0
        },
        comprehensiveAnalysis: adkData.comprehensiveAnalysis || 
          'Comprehensive analysis is being generated. Please check back in a moment.',
        nextSteps: adkData.nextSteps || 
          "Consider seeking mentorship, exploring funding options, and building your entrepreneurial fundamentals."
      };

    } catch (error) {
      console.error('ADK agent error:', error);
      throw new Error(`ADK agent failed to generate feedback: ${error}`);
    }
  }

  private getQuestionType(questionId: string): string {
    const questionTypeMap: Record<string, string> = {
      'q3': 'entrepreneurialJourney',
      'q8': 'businessChallenge', 
      'q18': 'setbacksResilience',
      'q23': 'finalVision'
    };
    return questionTypeMap[questionId] || 'entrepreneurialJourney';
  }
}
