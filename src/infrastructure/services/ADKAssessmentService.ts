/**
 * ADK Assessment Service
 * Integrates Google ADK Core Assessment Agent with existing Clean Architecture
 */

import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class ADKAssessmentService implements IAIScoringService {
  private readonly agentUrl: string;
  private readonly scoringAgentUrl: string;
  private readonly useADK: boolean;

  constructor() {
    // Use environment variable or default to deployed Cloud Functions agent
    this.agentUrl = process.env.ASSESSMENT_AGENT_URL || 
                   'https://us-central1-gutcheck-score-mvp.cloudfunctions.net/assessment-agent';
    
    // Use environment variable or default to deployed scoring agent
    this.scoringAgentUrl = process.env.OPEN_ENDED_SCORING_AGENT_URL || 
                          'https://us-central1-gutcheck-score-mvp.cloudfunctions.net/open-ended-scoring-agent';
    
    // A/B testing flag - defaults to true (use ADK) if not specified
    this.useADK = process.env.USE_ADK !== 'false';
    
    // Debug logging
    console.log('ADK AssessmentService initialized:', {
      agentUrl: this.agentUrl,
      scoringAgentUrl: this.scoringAgentUrl,
      useADK: this.useADK,
      env: {
        ASSESSMENT_AGENT_URL: process.env.ASSESSMENT_AGENT_URL,
        OPEN_ENDED_SCORING_AGENT_URL: process.env.OPEN_ENDED_SCORING_AGENT_URL,
        USE_ADK: process.env.USE_ADK
      }
    });
  }

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult> {
    try {
      // Call the specialized open-ended scoring agent
      const apiResponse = await fetch(this.scoringAgentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          response: response,
          question_text: questionText
        })
      });

      if (!apiResponse.ok) {
        throw new Error(`Scoring agent API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      if (!result.success) {
        throw new Error(`Scoring agent processing failed: ${result.error}`);
      }
      
      // Return the scored result from the agent
      return {
        score: result.score,
        explanation: result.explanation
      };
    } catch (error) {
      console.error('Open-ended scoring agent error:', error);
      // Re-throw the error to make agent failures immediately visible
      throw error;
    }
  }

  private getQuestionType(questionId: string): string {
    // Map question IDs to their types based on the locked assessment questions
    const openEndedQuestions = ['q3', 'q8', 'q18', 'q23'];
    const multiSelectQuestions = ['q9'];
    const likertQuestions = ['q10', 'q19'];
    
    if (openEndedQuestions.includes(questionId)) return 'openEnded';
    if (multiSelectQuestions.includes(questionId)) return 'multiSelect';
    if (likertQuestions.includes(questionId)) return 'likert';
    return 'multipleChoice';
  }

  private getQuestionCategory(questionId: string): string {
    // Map question IDs to their categories based on the locked assessment questions
    const categoryMap: Record<string, string> = {
      'q1': 'personalBackground', 'q2': 'personalBackground', 'q3': 'personalBackground',
      'q4': 'personalBackground', 'q5': 'personalBackground',
      'q6': 'entrepreneurialSkills', 'q7': 'entrepreneurialSkills', 'q8': 'entrepreneurialSkills',
      'q9': 'entrepreneurialSkills', 'q10': 'entrepreneurialSkills',
      'q11': 'resources', 'q12': 'resources', 'q13': 'resources', 'q14': 'resources', 'q15': 'resources',
      'q16': 'behavioralMetrics', 'q17': 'behavioralMetrics', 'q18': 'behavioralMetrics',
      'q19': 'behavioralMetrics', 'q20': 'behavioralMetrics',
      'q21': 'growthVision', 'q22': 'growthVision', 'q23': 'growthVision', 'q24': 'growthVision', 'q25': 'growthVision'
    };
    
    return categoryMap[questionId] || 'personalBackground';
  }

  private getHighestScoringCategory(categoryScores: any[]): string {
    if (!categoryScores || categoryScores.length === 0) return 'personalBackground';
    const highest = categoryScores.reduce((prev, current) => 
      (current.score > prev.score) ? current : prev
    );
    return highest.category || 'personalBackground';
  }

  private getLowestScoringCategory(categoryScores: any[]): string {
    if (!categoryScores || categoryScores.length === 0) return 'personalBackground';
    const lowest = categoryScores.reduce((prev, current) => 
      (current.score < prev.score) ? current : prev
    );
    return lowest.category || 'personalBackground';
  }

  async generateFeedback(
    responses: Record<string, unknown>[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    console.log('ADK AssessmentService.generateFeedback called:', {
      useADK: this.useADK,
      agentUrl: this.agentUrl,
      responsesCount: responses.length,
      scores,
      industry,
      location
    });

    // A/B testing: Check if we should use ADK or legacy system
    if (!this.useADK) {
      console.log('ADK AssessmentService: Using legacy system (USE_ADK=false)');
      return this.generateLegacyFeedback(responses, scores, industry, location);
    }

    try {
      console.log('ADK AssessmentService: Making request to deployed assessment agent...');
      
      // Calculate overall score from category scores
      const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
      
      // Transform the responses to match the agent's expected format
      const transformedResponses = responses.map((response: any) => ({
        question_id: response.questionId || response.question_id,
        question_text: response.questionText || response.question_text,
        response: response.response,
        question_type: this.getQuestionType(response.questionId || response.question_id),
        category: this.getQuestionCategory(response.questionId || response.question_id)
      }));
      
      // Call the deployed assessment agent
      const apiResponse = await fetch(this.agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: `feedback_${Date.now()}`,
          user_id: `user_${Date.now()}`, // Generate a temporary user ID
          industry: industry || 'General',
          location: location || 'Unknown',
          overall_score: overallScore,
          category_scores: scores,
          question_scores: {}, // The agent doesn't need individual question scores for feedback
          responses: transformedResponses
        })
      });

      console.log('ADK AssessmentService: Response status:', apiResponse.status, apiResponse.statusText);

      if (!apiResponse.ok) {
        throw new Error(`Assessment agent API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      if (!result.success) {
        throw new Error(`Assessment agent processing failed: ${result.error}`);
      }
      
      const data = result.data;
      
      // Debug logging
      console.log('ADK AssessmentService received agent data:', {
        key_insights: data.key_insights?.length,
        recommendations: data.recommendations?.length,
        competitive_advantage: data.competitive_advantage?.length,
        growth_opportunity: data.growth_opportunity?.length
      });
      
      // Transform the agent response to match the expected AIFeedback format
      return {
        feedback: data.key_insights?.join('\n\n') || '',
        competitiveAdvantage: {
          category: this.getHighestScoringCategory(Object.entries(scores).map(([category, score]) => ({ category, score }))),
          score: overallScore.toString(),
          summary: data.competitive_advantage || '',
          specificStrengths: data.key_insights || []
        },
        growthOpportunity: {
          category: this.getLowestScoringCategory(Object.entries(scores).map(([category, score]) => ({ category, score }))),
          score: overallScore.toString(),
          summary: data.growth_opportunity || '',
          specificWeaknesses: data.recommendations || []
        },
        scoreProjection: {
          currentScore: overallScore,
          projectedScore: overallScore,
          improvementPotential: 0
        },
        comprehensiveAnalysis: data.comprehensive_analysis || '',
        nextSteps: data.recommendations?.join('\n\n') || ''
      };
    } catch (error) {
      console.error('Assessment agent feedback generation error:', error);
      console.log('ADK AssessmentService: Error details:', {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      // Re-throw the error to make agent failures immediately visible
      throw error;
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
      // Re-throw the error to make failures immediately visible
      throw error;
    }
  }

  async checkADKServerHealth(): Promise<boolean> {
    try {
      const response = await fetch(this.agentUrl);
      return response.ok;
    } catch (error) {
      console.error('Assessment agent health check failed:', error);
      return false;
    }
  }

  async getAgentInfo(): Promise<any> {
    try {
      const response = await fetch(this.agentUrl);
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          service: 'Assessment Analysis Agent',
          version: '1.0.0',
          url: this.agentUrl
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get assessment agent info:', error);
      return null;
    }
  }
}
