import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class GeminiAIService implements IAIScoringService {
  constructor(private readonly apiKey: string) {}

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult> {
    // Map question IDs to question types
    const questionTypeMap: Record<string, string> = {
      'q3': 'entrepreneurialJourney',
      'q8': 'businessChallenge', 
      'q18': 'setbacksResilience',
      'q23': 'finalVision'
    };

    const questionType = questionTypeMap[questionId] || 'entrepreneurialJourney';

    // Call Firebase Function for AI scoring
    const apiResponse = await fetch('https://us-central1-gutcheck-score-mvp.cloudfunctions.net/scoreQuestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionType,
        response,
        questionText
      })
    });

    if (!apiResponse.ok) {
      throw new Error(`API error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
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
    // Call the feedback Firebase Function for AI feedback generation
    const apiResponse = await fetch('https://us-central1-gutcheck-score-mvp.cloudfunctions.net/generateFeedback', {
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
      throw new Error(`API error: ${apiResponse.statusText}`);
    }

    const data = await apiResponse.json();
    return {
      feedback: data.feedback || 'AI feedback generation completed.',
      competitiveAdvantage: data.competitiveAdvantage || {
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
      growthOpportunity: data.growthOpportunity || {
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
      scoreProjection: data.scoreProjection || {
        currentScore: 0,
        projectedScore: 0,
        improvementPotential: 0
      },
      comprehensiveAnalysis: data.comprehensiveAnalysis,
      nextSteps: data.nextSteps
    };
  }

  private buildScoringPrompt(questionId: string, response: string, questionText: string): string {
    const scoringPrompts: Record<string, string> = {
      entrepreneurialJourney: `You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response on a scale of 1-5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Question: ${questionText}

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      businessChallenge: `You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response on a scale of 1-5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Question: ${questionText}

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      setbacksResilience: `You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response on a scale of 1-5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Question: ${questionText}

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      finalVision: `You are an expert business evaluator assessing a founder's long-term vision.
Score this response on a scale of 1-5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

Question: ${questionText}

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`
    };

    // Map question IDs to prompt types
    const questionPromptMap: Record<string, string> = {
      'q3': 'entrepreneurialJourney',
      'q8': 'businessChallenge',
      'q18': 'setbacksResilience',
      'q25': 'finalVision',
    };

    const promptType = questionPromptMap[questionId] || 'entrepreneurialJourney';
    return scoringPrompts[promptType];
  }

  private buildFeedbackPrompt(responses: Record<string, unknown>[], scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    const categoryBreakdown = `
- Personal Foundation: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources & Network: ${scores.resources}/20
- Behavioral Patterns: ${scores.behavioralMetrics}/15
- Vision & Growth: ${scores.growthVision}/20
`;
    return `You are an expert business consultant providing personalized feedback to an entrepreneur.

Assessment Scores:
${categoryBreakdown}
Overall Score: ${Object.values(scores).reduce((sum, score) => sum + score, 0)}/100

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

Provide personalized, actionable feedback in 2-3 paragraphs. Focus on the entrepreneur's strengths and areas for improvement. Be encouraging but honest.`;
  }

  private buildStrengthsPrompt(scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    const categoryBreakdown = `
- Personal Foundation: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources & Network: ${scores.resources}/20
- Behavioral Patterns: ${scores.behavioralMetrics}/15
- Vision & Growth: ${scores.growthVision}/20
`;
    return `Based on these assessment scores, identify the entrepreneur's key strengths:

${categoryBreakdown}

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

List 3-4 specific strengths in bullet points. Be specific and encouraging.`;
  }

  private buildFocusAreasPrompt(scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    const categoryBreakdown = `
- Personal Foundation: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources & Network: ${scores.resources}/20
- Behavioral Patterns: ${scores.behavioralMetrics}/15
- Vision & Growth: ${scores.growthVision}/20
`;
    return `Based on these assessment scores, identify areas for improvement:

${categoryBreakdown}

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

List 3-4 specific focus areas in bullet points. Be constructive and actionable.`;
  }

  private buildNextStepsPrompt(scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    const categoryBreakdown = `
- Personal Foundation: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources & Network: ${scores.resources}/20
- Behavioral Patterns: ${scores.behavioralMetrics}/15
- Vision & Growth: ${scores.growthVision}/20
`;
    return `Based on these assessment scores, provide specific next steps:

${categoryBreakdown}

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

Provide 3-4 specific, actionable next steps in bullet points. Include resources, tools, or strategies they can implement immediately.`;
  }

  private async callGemini(prompt: string): Promise<string> {
    // Map question IDs to question types for the API
    const questionTypeMap: Record<string, string> = {
      'q3': 'entrepreneurialJourney',
      'q8': 'businessChallenge', 
      'q18': 'setbacksResilience',
      'q23': 'finalVision'
    };

    // Extract question ID from the prompt
    const questionIdMatch = prompt.match(/questionId.*?['"`]([^'"`]+)['"`]/);
    const questionId = questionIdMatch ? questionIdMatch[1] : 'q3';
    const questionType = questionTypeMap[questionId] || 'entrepreneurialJourney';

    // Extract response from the prompt
    const responseMatch = prompt.match(/Founder's Response:\s*([\s\S]*?)(?=\n\n|Return your evaluation|$)/);
    const response = responseMatch ? responseMatch[1].trim() : '';

    // Call Cloud Function instead of API route
    const { getFunctions, httpsCallable } = await import('firebase/functions');
    const functions = getFunctions();
    const scoreResponse = httpsCallable(functions, 'scoreResponse');

    try {
      const result = await scoreResponse({
        questionType,
        response
      });

      const data = result.data as any;
      if (data.success) {
        return data.explanation || 'AI evaluation completed';
      } else {
        throw new Error('Failed to score response');
      }
    } catch (error) {
      console.error('Error calling Cloud Function:', error);
      throw new Error('Failed to score response');
    }
  }

  private parseResponse(response: string): AIScoringResult {
    try {
      // Try to parse as JSON first
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          score: Math.max(1, Math.min(5, Math.round(parsed.score || 3))),
          explanation: parsed.explanation || 'AI evaluation completed'
        };
      }

      // Extract score from text
      const scoreMatch = response.match(/score["\s:]*(\d+)/i);
      if (!scoreMatch) {
        throw new Error('Unable to extract score from AI response. Please ensure AI scoring is working properly.');
      }
      const score = parseInt(scoreMatch[1]);
      
      return {
        score: Math.max(1, Math.min(5, score)),
        explanation: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error('AI scoring failed. Please ensure AI scoring is working properly.');
    }
  }
} 