import { IAIScoringService, AIScoringResult, AIFeedback } from '../../domain/repositories/IAIScoringService';
import { AssessmentCategory } from '../../domain/value-objects/Category';

export class GeminiAIService implements IAIScoringService {
  constructor(private readonly apiKey: string) {}

  async scoreOpenEndedResponse(
    questionId: string,
    response: string,
    questionText: string
  ): Promise<AIScoringResult> {
    const prompt = this.buildScoringPrompt(questionId, response, questionText);
    const result = await this.callGemini(prompt);
    return this.parseResponse(result);
  }

  async generateFeedback(
    responses: any[],
    scores: Record<AssessmentCategory, number>,
    industry?: string,
    location?: string
  ): Promise<AIFeedback> {
    const feedbackPrompt = this.buildFeedbackPrompt(responses, scores, industry, location);
    const feedbackResult = await this.callGemini(feedbackPrompt);
    
    const strengthsPrompt = this.buildStrengthsPrompt(scores, industry, location);
    const strengthsResult = await this.callGemini(strengthsPrompt);
    
    const focusAreasPrompt = this.buildFocusAreasPrompt(scores, industry, location);
    const focusAreasResult = await this.callGemini(focusAreasPrompt);
    
    const nextStepsPrompt = this.buildNextStepsPrompt(scores, industry, location);
    const nextStepsResult = await this.callGemini(nextStepsPrompt);

    return {
      feedback: feedbackResult,
      strengths: strengthsResult,
      focusAreas: focusAreasResult,
      nextSteps: nextStepsResult,
    };
  }

  private buildScoringPrompt(questionId: string, response: string, questionText: string): string {
    const scoringPrompts: Record<string, string> = {
      entrepreneurialJourney: `You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response on a scale of 1-5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      businessChallenge: `You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response on a scale of 1-5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      setbacksResilience: `You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response on a scale of 1-5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      finalVision: `You are an expert business evaluator assessing a founder's long-term vision.
Score this response on a scale of 1-5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

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

  private buildFeedbackPrompt(responses: any[], scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    return `You are an expert business consultant providing personalized feedback to an entrepreneur.

Assessment Scores:
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20
- Overall Score: ${Object.values(scores).reduce((sum, score) => sum + score, 0)}/100

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

Provide personalized, actionable feedback in 2-3 paragraphs. Focus on the entrepreneur's strengths and areas for improvement. Be encouraging but honest.`;
  }

  private buildStrengthsPrompt(scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    return `Based on these assessment scores, identify the entrepreneur's key strengths:

- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

List 3-4 specific strengths in bullet points. Be specific and encouraging.`;
  }

  private buildFocusAreasPrompt(scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    return `Based on these assessment scores, identify areas for improvement:

- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

List 3-4 specific focus areas in bullet points. Be constructive and actionable.`;
  }

  private buildNextStepsPrompt(scores: Record<AssessmentCategory, number>, industry?: string, location?: string): string {
    return `Based on these assessment scores, provide specific next steps:

- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20

${industry ? `Industry: ${industry}` : ''}
${location ? `Location: ${location}` : ''}

Provide 3-4 specific, actionable next steps in bullet points. Include resources, tools, or strategies they can implement immediately.`;
  }

  private async callGemini(prompt: string): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Gemini API');
    }

    return responseText;
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

      // Fallback: extract score from text
      const scoreMatch = response.match(/score["\s:]*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 3;
      
      return {
        score: Math.max(1, Math.min(5, score)),
        explanation: response.substring(0, 200) + (response.length > 200 ? '...' : '')
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        score: 3,
        explanation: 'AI evaluation completed with fallback score'
      };
    }
  }
} 