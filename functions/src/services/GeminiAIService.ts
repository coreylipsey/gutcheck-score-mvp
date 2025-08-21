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
export async function generateKeyInsights(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const overallScore = Object.values(scores).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number;
  
  const prompt = `You are an expert business evaluator providing key insights from an entrepreneurial assessment.

Assessment Overview:
- Overall Score: ${overallScore}/100
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth Vision: ${scores.growthVision}/20
- Industry: ${industry || 'General'}
- Location: ${location || 'Unknown'}

Write a 2-sentence executive summary that captures the most important insights about this entrepreneur's profile. Focus on the overall assessment picture, highlighting key strengths and critical areas for improvement. Be specific and actionable.

Keep it concise and impactful - maximum 200 characters total.`;

  const response = await callGemini(prompt, apiKey);
  return response;
}

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
  const highestCategory = Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) > (scores[b[0] as keyof typeof scores] as number) ? a : b);
  
  const prompt = `Context:
You are an expert business evaluator analyzing an entrepreneur's assessment results. Your goal is to extract actionable insights by identifying their top strengths based on their Gutcheck Score.

Assessment Categories & Scores:

Personal Background Score: ${scores.personalBackground}/20

Entrepreneurial Skills Score: ${scores.entrepreneurialSkills}/25

Resources Score: ${scores.resources}/20

Behavioral Metrics Score: ${scores.behavioralMetrics}/15

Growth & Vision Score: ${scores.growthVision}/20

Industry: ${industry || 'Creative & Media'}

Location: ${location || 'Delaware'}

🔍 Instructions for Response Formatting
Step 1: Identify Strengths
Select the highest-scoring category as the key strength area.
Provide a concise and encouraging 1-2 sentence explanation with a practical recommendation.
Max 200 characters for the entire response.
No little hashtags or stars or any other weird characters, just the text.`;

  const response = await callGemini(prompt, apiKey);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      category: highestCategory[0],
      score: (highestCategory[1] as number).toString(),
      summary: response,
      specificStrengths: [response]
    };
  } catch (error) {
    return {
      category: highestCategory[0],
      score: (highestCategory[1] as number).toString(),
      summary: response,
      specificStrengths: [response]
    };
  }
}

export async function generateGrowthOpportunity(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const lowestCategory = Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) < (scores[b[0] as keyof typeof scores] as number) ? a : b);
  
  const prompt = `Context:
You are an expert business evaluator analyzing an entrepreneur's assessment results. Your goal is to extract actionable insights by identifying their key improvement areas based on their Gutcheck Score.

Assessment Categories & Scores:

Personal Background Score: ${scores.personalBackground}/20

Entrepreneurial Skills Score: ${scores.entrepreneurialSkills}/25

Resources Score: ${scores.resources}/20

Behavioral Metrics Score: ${scores.behavioralMetrics}/15

Growth & Vision Score: ${scores.growthVision}/20

Industry: ${industry || 'Creative & Media'}

Location: ${location || 'Delaware'}

🔍 Instructions for Response Formatting
Step 1: Identify Areas for Improvement
Select the lowest-scoring category as the key area for improvement.
Provide a concise and encouraging 1-2 sentence explanation with a practical recommendation.
Max 200 characters for the entire response.
No little hashtags or stars or any other weird characters, just the text.`;

  const response = await callGemini(prompt, apiKey);
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {
      category: lowestCategory[0],
      score: (lowestCategory[1] as number).toString(),
      summary: response,
      specificWeaknesses: [response]
    };
  } catch (error) {
    return {
      category: lowestCategory[0],
      score: (lowestCategory[1] as number).toString(),
      summary: response,
      specificWeaknesses: [response]
    };
  }
}

export async function generateTruthfulScoreProjection(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const currentScore = Object.values(scores).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number;
  
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
  // Extract open-ended responses for the comprehensive analysis
  const openEndedResponses = responses.filter(r => ['q3', 'q8', 'q18', 'q23'].includes(r.questionId));
  
  const visionResponse = openEndedResponses.find(r => r.questionId === 'q23')?.response || 'Not provided';
  const journeyResponse = openEndedResponses.find(r => r.questionId === 'q3')?.response || 'Not provided';
  const challengeResponse = openEndedResponses.find(r => r.questionId === 'q8')?.response || 'Not provided';
  const setbackResponse = openEndedResponses.find(r => r.questionId === 'q18')?.response || 'Not provided';
  
  const prompt = `You are an expert entrepreneurship coach and evaluator. Based on a founder's responses to the four key questions below, generate a short paragraph (3-4 sentences) of encouraging and insightful feedback. 

Your role is to provide honest, constructive guidance that helps the founder recognize what they're doing well, where they can improve, and what next step would make the biggest difference. Use a warm, growth-oriented tone—like a coach who genuinely wants them to win. Be specific, but avoid jargon or over-generalization.

Founder's Responses:
- Vision Statement: ${visionResponse}
- Entrepreneurial Journey: ${journeyResponse}
- Business Challenge: ${challengeResponse}
- Setback Response: ${setbackResponse}

---

Response Format:
Return ONLY the response as plain text, without JSON formatting, markdown, or additional headers. Do NOT include the original responses or re-summarize them. Do NOT exceed 120 words. Make it feel personalized and authentic.`;

  const response = await callGemini(prompt, apiKey);
  return response;
}

export async function generateNextStepsText(scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const prompt = `Context:
You are an expert business evaluator analyzing an entrepreneur's assessment results. Your goal is to extract actionable insights by identifying their personalized next steps based on their Gutcheck Score.

Assessment Categories & Scores:

Personal Background Score: ${scores.personalBackground}/20

Entrepreneurial Skills Score: ${scores.entrepreneurialSkills}/25

Resources Score: ${scores.resources}/20

Behavioral Metrics Score: ${scores.behavioralMetrics}/15

Growth & Vision Score: ${scores.growthVision}/20

Industry: ${industry || 'Creative & Media'}

Location: ${location || 'Delaware'}

Step 1: Generate Personalized Next Steps
🔴 HARD RULE: MUST INCLUDE CURRENT, VALID, AND SPECIFIC LINKS
Mentorship:
Identify an active and credible mentorship program, incubator, accelerator, or networking group specific to the entrepreneur's exact industry and location. Verify that the link is active and the community is currently accepting new participants. If no local program exists, suggest an online mentorship community (not generic like Y Combinator or Techstars—find specific, niche communities like Slack groups, active LinkedIn groups, or industry-specific Reddit communities).
Resources:
Find current grants, funding opportunities, or business tools specifically relevant to their industry and location.
Provide direct application links whenever available. Ensure the resource's link is valid and active. If local resources aren't found, recommend reputable online platforms offering grants or tools (e.g., Hello Alice, Fundera, local Chamber of Commerce funding pages).
Learning:
Recommend a currently available and relevant course, article, book, or video directly addressing their improvement areas.
Source from highly regarded platforms (e.g., Coursera, Udemy, Amazon, Skillshare) or recent (within the last year) highly rated Medium articles, LinkedIn articles, or industry blogs. Confirm the link is accessible and current.
Your response should feel tailored, actionable, and timely, resembling a personalized coaching conversation.
Clearly label each step and category.
Ensure all recommended links are verified and active before including them.
max 200 characters for each category.
No little hashtags or stars or any other weird characters, just the text.
See below an example of how the output should look:
Mentorship: Delaware Innovation Space
Funding: Delaware Arts Grants
Learning: Coursera's "Creative Entrepreneurship"`;

  const response = await callGemini(prompt, apiKey);
  return response;
}

export { callGemini, parseGeminiResponse };
