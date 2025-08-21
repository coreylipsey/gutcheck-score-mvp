import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';
import { ASSESSMENT_QUESTIONS } from '../../domain/entities/Assessment';

export class ADKAssessmentService implements IAIScoringService {
  private readonly useADK: boolean;
  private readonly agentUrl: string;
  private readonly scoringAgentUrl: string;
  private readonly adkServerUrl: string;

  constructor() {
    this.useADK = process.env.NEXT_PUBLIC_USE_ADK_AGENT === 'true';
    this.agentUrl = process.env.NEXT_PUBLIC_ASSESSMENT_AGENT_URL || 'http://localhost:8000/process_assessment';
    this.scoringAgentUrl = process.env.NEXT_PUBLIC_OPEN_ENDED_SCORING_AGENT_URL || 'http://localhost:8000/score_open_ended';
    this.adkServerUrl = process.env.NEXT_PUBLIC_ADK_SERVER_URL || 'http://localhost:8000';
    
    console.log('ADK AssessmentService initialized:', {
      agentUrl: this.agentUrl,
      scoringAgentUrl: this.scoringAgentUrl,
      useADK: this.useADK,
      env: {
        NEXT_PUBLIC_USE_ADK_AGENT: process.env.NEXT_PUBLIC_USE_ADK_AGENT,
        NEXT_PUBLIC_ASSESSMENT_AGENT_URL: process.env.NEXT_PUBLIC_ASSESSMENT_AGENT_URL,
        NEXT_PUBLIC_OPEN_ENDED_SCORING_AGENT_URL: process.env.NEXT_PUBLIC_OPEN_ENDED_SCORING_AGENT_URL
      }
    });
  }

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult> {
    try {
      console.log(`Scoring open-ended question ${questionId} with agent`);
      
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
        throw new Error(`Open-ended scoring agent API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      if (!result.success) {
        throw new Error(`Open-ended scoring failed: ${result.error}`);
      }

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

  private getQuestionText(questionId: string): string {
    const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
    return question?.text || `Question ${questionId}`;
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
      
      // Transform the responses to match the agent's expected format (simplified)
      const transformedResponses = responses.map((response: any) => ({
        questionId: response.questionId || response.question_id,
        response: response.response
      }));
      
      // Call the deployed assessment agent
      const apiResponse = await fetch(this.agentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: transformedResponses,
          scores: scores,
          industry: industry || 'General',
          location: location || 'Unknown'
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
      
      // Calculate overall score from category scores
      const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;
      
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
        throw new Error(`Legacy feedback API error: ${apiResponse.statusText}`);
      }

      const result = await apiResponse.json();
      
      if (!result.success) {
        throw new Error(`Legacy feedback generation failed: ${result.error || 'Unknown error'}`);
      }
      
      return result.data;
    } catch (error) {
      console.error('Legacy feedback generation error:', error);
      // Re-throw the error to make failures immediately visible
      throw error;
    }
  }
}
