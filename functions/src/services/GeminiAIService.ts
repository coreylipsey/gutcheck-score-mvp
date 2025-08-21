import { GoogleGenerativeAI } from '@google/generative-ai';

// Call Gemini API
async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

// Parse Gemini response
function parseGeminiResponse(response: string): { score: number; explanation: string } {
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

// AI Helper Functions
export async function generateFeedbackText(responses: any[], scores: any, apiKey: string): Promise<string> {
  const prompt = `You are an expert business evaluator providing feedback on an entrepreneurial assessment.

Assessment Scores:
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth Vision: ${scores.growthVision}/20
- Overall Score: ${Object.values(scores).reduce((a: any, b: any) => a + b, 0)}/100

Provide 3-4 key insights about this entrepreneur's profile, focusing on their strengths and areas for improvement. Be specific and actionable.`;

  const response = await callGemini(prompt, apiKey);
  return response;
}

export async function generateCompetitiveAdvantage(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const highestCategory = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b);
  
  const prompt = `You are an expert business evaluator identifying competitive advantages.

Assessment Context:
- Industry: ${industry || 'General'}
- Location: ${location || 'Unknown'}
- Highest Scoring Category: ${highestCategory[0]} (${highestCategory[1]} points)

Based on this entrepreneur's assessment results, identify their primary competitive advantage. Focus on their strongest category and how it positions them for success.

Return a JSON object with:
- category: the strongest category
- score: the score as a string
- summary: 2-3 sentences about their competitive advantage
- specificStrengths: array of 3-4 specific strengths`;

  const response = await callGemini(prompt, apiKey);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      category: highestCategory[0],
      score: highestCategory[1].toString(),
      summary: response,
      specificStrengths: [response]
    };
  } catch (error) {
    return {
      category: highestCategory[0],
      score: highestCategory[1].toString(),
      summary: response,
      specificStrengths: [response]
    };
  }
}

export async function generateGrowthOpportunity(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const lowestCategory = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] < scores[b[0] as keyof typeof scores] ? a : b);
  
  const prompt = `You are an expert business evaluator identifying growth opportunities.

Assessment Context:
- Industry: ${industry || 'General'}
- Location: ${location || 'Unknown'}
- Lowest Scoring Category: ${lowestCategory[0]} (${lowestCategory[1]} points)

Based on this entrepreneur's assessment results, identify their primary growth opportunity. Focus on their weakest category and how improving it could significantly impact their success.

Return a JSON object with:
- category: the weakest category
- score: the score as a string
- summary: 2-3 sentences about their growth opportunity
- specificWeaknesses: array of 3-4 specific areas for improvement`;

  const response = await callGemini(prompt, apiKey);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      category: lowestCategory[0],
      score: lowestCategory[1].toString(),
      summary: response,
      specificWeaknesses: [response]
    };
  } catch (error) {
    return {
      category: lowestCategory[0],
      score: lowestCategory[1].toString(),
      summary: response,
      specificWeaknesses: [response]
    };
  }
}

export async function generateTruthfulScoreProjection(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const currentScore = Object.values(scores).reduce((a: any, b: any) => a + b, 0);
  
  const prompt = `You are an expert business evaluator providing realistic score projections.

Current Assessment Score: ${currentScore}/100
Industry: ${industry || 'General'}
Location: ${location || 'Unknown'}

Based on the assessment results, provide a realistic projection of how much the score could improve with focused effort on the weakest areas. Be conservative and realistic.

Return a JSON object with:
- currentScore: ${currentScore}
- projectedScore: realistic projection (max 100)
- improvementPotential: the difference between current and projected`;

  const response = await callGemini(prompt, apiKey);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      currentScore: currentScore,
      projectedScore: Math.min(100, currentScore + 10),
      improvementPotential: 10
    };
  } catch (error) {
    return {
      currentScore: currentScore,
      projectedScore: Math.min(100, currentScore + 10),
      improvementPotential: 10
    };
  }
}

export async function generateComprehensiveAnalysis(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const prompt = `You are an expert business evaluator providing comprehensive analysis.

Assessment Scores:
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth Vision: ${scores.growthVision}/20
- Overall Score: ${Object.values(scores).reduce((a: any, b: any) => a + b, 0)}/100

Industry: ${industry || 'General'}
Location: ${location || 'Unknown'}

Provide a comprehensive 3-4 paragraph analysis of this entrepreneur's profile. Include:
1. Overall assessment of their entrepreneurial readiness
2. Key strengths and how they position them for success
3. Critical areas for improvement and specific recommendations
4. Industry-specific insights and opportunities

Be thorough, specific, and actionable.`;

  const response = await callGemini(prompt, apiKey);
  return response;
}

export async function generateNextStepsText(scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const prompt = `You are an expert business evaluator providing actionable next steps.

Assessment Scores:
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth Vision: ${scores.growthVision}/20

Industry: ${industry || 'General'}
Location: ${location || 'Unknown'}

Provide 4-5 specific, actionable next steps this entrepreneur should take to improve their profile and increase their chances of success. Focus on the areas where they scored lowest and provide concrete, implementable recommendations.

Format as a numbered list with clear, specific actions.`;

  const response = await callGemini(prompt, apiKey);
  return response;
}

export { callGemini, parseGeminiResponse };
