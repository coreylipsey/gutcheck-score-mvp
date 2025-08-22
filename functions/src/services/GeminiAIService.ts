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
  
  // Find highest and lowest scoring categories
  const highestCategory = Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) > (scores[b[0] as keyof typeof scores] as number) ? a : b);
  const lowestCategory = Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) < (scores[b[0] as keyof typeof scores] as number) ? a : b);
  
  // Map category names to display names
  const categoryDisplayNames: Record<string, string> = {
    'personalBackground': 'Personal Background',
    'entrepreneurialSkills': 'Entrepreneurial Skills', 
    'resources': 'Resources',
    'behavioralMetrics': 'Behavioral Metrics',
    'growthVision': 'Growth & Vision'
  };
  
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

Key Findings:
- Highest Scoring Category: ${categoryDisplayNames[highestCategory[0]]} (${highestCategory[1]}/20)
- Lowest Scoring Category: ${categoryDisplayNames[lowestCategory[0]]} (${lowestCategory[1]}/20)

Write a 2-sentence executive summary that captures the most important insights about this entrepreneur's profile. Focus on their key strengths and critical areas for improvement. Be specific and actionable.

Keep it concise and impactful - maximum 200 characters total. Do NOT include specific numerical scores in the summary.`;

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
  const overallScore = Object.values(scores).reduce((sum: number, score: any) => sum + (score as number), 0);
  
  const prompt = `You are an expert entrepreneurship consultant calculating realistic score improvements for an individual entrepreneur.

IMPORTANT: This assessment evaluates the ENTREPRENEUR/FOUNDER, not the company. Always refer to the individual entrepreneur using "you," "your," or "the entrepreneur" - never "this company," "this entity," or "the business."

ASSESSMENT DATA:
${responses.map((r: any) => `
Question ${r.questionId}: ${r.questionText}
Response: ${r.response}
`).join('\n')}

CURRENT SCORES:
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources & Network: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20
- Overall Score: ${overallScore}/100

TASK: 
1. Identify the lowest-scoring category (Biggest Growth Opportunity for the entrepreneur)
2. Analyze specific responses in that category
3. Calculate realistic point improvements based on the scoring rubric
4. Sum the improvements to get the projected score

SCORING RUBRIC:
- Multiple choice: Specific point values (e.g., "Weekly"=5, "Monthly"=4, "Occasionally"=3)
- Open-ended: AI scored 1-5 based on quality and depth

OUTPUT FORMAT (JSON):
{
  "currentScore": ${overallScore},
  "projectedScore": 68,
  "improvementPotential": 3,
  "analysis": {
    "lowestCategory": "Entrepreneurial Skills",
    "currentCategoryScore": 15,
    "realisticImprovements": [
      {
        "questionId": "q17",
        "currentResponse": "Occasionally",
        "currentScore": 3,
        "suggestedImprovement": "Weekly",
        "potentialScore": 4,
        "pointGain": 1,
        "reasoning": "Moving from occasional to weekly goal tracking"
      }
    ],
    "totalPointGain": 3
  }
}

INSTRUCTIONS:
- Only suggest improvements that are realistically achievable for the entrepreneur
- Base projections on actual response changes, not hypothetical scenarios
- Be conservative - under-promise and over-deliver
- Focus on the lowest-scoring category first
- Provide specific, actionable recommendations for the entrepreneur
- Use "you" or "your" language when referring to the entrepreneur`;

  const response = await callGemini(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error parsing score projection response:', error);
    throw new Error(`Score projection generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateComprehensiveAnalysis(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  
  const prompt = `You are a seasoned entrepreneurial scout, analyzing the signals from a founder's Gutcheck Assessment the way an NFL scout would evaluate a player's combine results and tape. Your role is not to prescribe or judge, but to surface signals, tendencies, and overlooked strengths/risks that help explain where this entrepreneur sits on their trajectory.

IMPORTANT: This assessment evaluates the ENTREPRENEUR/FOUNDER, not the company. Always refer to the individual entrepreneur using "you," "your," or "the entrepreneur" - never "this company," "this entity," or "the business."

ASSESSMENT DATA:
${responses.map((r: any) => `
Question ${r.questionId}: ${r.questionText}
Response: ${r.response}
`).join('\n')}

CURRENT SCORES:
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20

TASK: Produce a 2-3 paragraph scouting-style report that includes:
1. **Signal Readout** – interpret the score and explain what it means in context, like a scout explaining combine numbers
2. **Strength Signals** – highlight competitive advantages or unique tendencies (e.g., resilience under pressure, strong networks, disciplined routines)
3. **Development Areas** – note where signals suggest gaps or undervalued traits (e.g., limited capital access, inconsistent tracking, hesitation in risk-taking)
4. **Trajectory Indicators** – suggest next moves or opportunities that could elevate their "market value" as an entrepreneur (like a coach pointing out how to turn raw talent into production)

OUTPUT FORMAT: Plain text, 2-3 paragraphs

TONE GUIDANCE:
- Warm, constructive, growth-oriented — like a scout who genuinely wants the player to succeed
- Honest but encouraging, balancing candor with motivation
- Specific, concrete observations rather than generic praise/criticism
- Use metaphors where helpful (e.g., "You've built a strong baseline, but your goal-tracking is like a quarterback with good instincts who hasn't yet mastered the playbook")
- Never prescriptive — frame insights as signals and indicators, not verdicts
- Make it feel personalized and authentic

LANGUAGE RULES:
- ALWAYS use first person: "you," "your," "yourself" - never "the entrepreneur," "the founder," or third person
- NEVER use "this company," "this entity," "the business," or "the organization"
- Focus on personal skills, behaviors, and capabilities
- Be consistent throughout - every sentence should use "you" language`;

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

export async function generateRealisticImprovements(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  // Find the lowest scoring category
  const lowestCategory = Object.entries(scores).reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) < (scores[b[0] as keyof typeof scores] as number) ? a : b);
  
  // Map question IDs to their categories
  const questionCategoryMap: Record<string, string> = {
    'q1': 'personalBackground', 'q2': 'personalBackground', 'q3': 'personalBackground',
    'q4': 'personalBackground', 'q5': 'personalBackground',
    'q6': 'entrepreneurialSkills', 'q7': 'entrepreneurialSkills', 'q8': 'entrepreneurialSkills',
    'q9': 'entrepreneurialSkills', 'q10': 'entrepreneurialSkills',
    'q11': 'resources', 'q12': 'resources', 'q13': 'resources', 'q14': 'resources', 'q15': 'resources',
    'q16': 'behavioralMetrics', 'q17': 'behavioralMetrics', 'q18': 'behavioralMetrics',
    'q19': 'behavioralMetrics', 'q20': 'behavioralMetrics',
    'q21': 'growthVision', 'q22': 'growthVision', 'q23': 'growthVision', 'q24': 'growthVision', 'q25': 'growthVision'
  };

  // Get responses for the lowest category
  const lowestCategoryResponses = responses.filter(r => questionCategoryMap[r.questionId] === lowestCategory[0]);
  
  // 🔒 ACTUAL ASSESSMENT SCORING MAPS - DO NOT MODIFY
  const scoringMaps: Record<string, number[]> = {
    // SECTION 1: Personal Foundation
    'q1': [3, 4, 5], // Idea stage=3, Early ops=4, Established=5
    'q2': [3, 4, 5], // Solo=3, Small team=4, Large team=5
    'q4': [5, 4, 3], // Still running=5, Failed=4, First time=3
    'q5': [5, 4, 3, 2], // Market opportunity=5, Income=4, Independence=3, Other=2
    
    // SECTION 2: Entrepreneurial Skills
    'q6': [5, 4, 3, 2], // Excellent=5, Good=4, Fair=3, Poor=2
    'q7': [5, 4, 3, 2], // Daily=5, Weekly=4, Monthly=3, Rarely=2
    
    // SECTION 3: Resources
    'q11': [2, 3, 4, 5, 0], // Lack funding=2, Limited mentorship=3, Access customers=4, Scaling=5, Other=0
    'q12': [5, 4, 3], // Sufficient=5, Not enough=4, Self-funded=3
    'q13': [5, 4, 3], // Very strong=5, Moderate=4, Weak=3
    'q14': [5, 3], // Yes=5, No=3
    'q15': [5, 4, 3, 2], // Weekly=5, Monthly=4, Occasionally=3, Rarely=2
    
    // SECTION 4: Behavioral Metrics
    'q16': [2, 3, 4, 5], // 1-10 hours=2, 11-20=3, 21-40=4, 40+=5
    'q17': [5, 4, 3], // Prioritize=5, Occasionally=4, No routine=3
    'q20': [5, 4, 3], // Restarted=5, Haven't restarted=4, No=3
    
    // SECTION 5: Growth & Vision
    'q21': [3, 4, 5], // Small-scale=3, Regional=4, Global=5
    'q22': [3, 4, 5, 2], // Bootstrapping=3, Loans/grants=4, Investments=5, Unsure=2
    'q24': [4, 5, 3, 2], // 1-5 jobs=4, 6+ jobs=5, No=3, Not sure=2
    'q25': [5, 3, 2], // Yes=5, No=3, Not sure=2
  };

  // Question options mapping
  const questionOptions: Record<string, string[]> = {
    'q1': ['Idea/Concept stage', 'Early operations with a few customers', 'Established and generating consistent revenue'],
    'q2': ['Solo entrepreneur', 'Small team (2–5 people)', 'Larger team (6+ people)'],
    'q4': ['Yes – it\'s still running', 'Yes – it failed', 'No – this is my first'],
    'q5': ['I saw a market opportunity', 'I needed income to support myself or my family', 'I wanted independence or flexibility', 'Other'],
    'q6': ['Excellent: I can confidently manage budgets, forecasts, and financial analysis', 'Good: I understand basic budgeting and cash flow management', 'Fair: I need help understanding financial documents', 'Poor: I avoid managing finances whenever possible'],
    'q7': ['Daily', 'Weekly', 'Monthly', 'Rarely or never'],
    'q11': ['Lack of funding', 'Limited access to mentorship', 'Difficulty accessing customers', 'Challenges with scaling', 'Other'],
    'q12': ['Sufficient funding for current needs', 'Not enough funding for growth', 'Self-funded with limited resources'],
    'q13': ['Very strong network', 'Moderate network', 'Weak network'],
    'q14': ['Yes', 'No'],
    'q15': ['Weekly', 'Monthly', 'Occasionally', 'Rarely'],
    'q16': ['1-10 hours', '11-20 hours', '21-40 hours', '40+ hours'],
    'q17': ['I prioritize and stick to a routine', 'I occasionally prioritize', 'I don\'t have a routine'],
    'q20': ['Yes, I restarted', 'Yes, I haven\'t restarted yet', 'No'],
    'q21': ['Small-scale operation', 'Regional business', 'Global business'],
    'q22': ['Bootstrapping', 'Loans or grants', 'Outside investments', 'Unsure'],
    'q24': ['1-5 different jobs', '6+ different jobs', 'No', 'Not sure'],
    'q25': ['Yes', 'No', 'Not sure']
  };

  // Analyze each response in the lowest category
  const improvements: Array<{
    questionId: string;
    currentResponse: string;
    currentScore: number;
    suggestedImprovement: string;
    potentialScore: number;
    pointGain: number;
    reasoning: string;
  }> = [];

  for (const response of lowestCategoryResponses) {
    const questionId = response.questionId;
    const currentResponse = response.response;
    const scoringMap = scoringMaps[questionId];
    const options = questionOptions[questionId];
    
    if (!scoringMap || !options) continue;
    
    // Find current score
    const optionIndex = options.indexOf(currentResponse);
    const currentScore = optionIndex !== -1 ? scoringMap[optionIndex] : 0;
    
    // Find the highest possible score for this question
    const maxScore = Math.max(...scoringMap);
    const potentialScore = maxScore;
    const pointGain = potentialScore - currentScore;
    
    // Only include if there's room for improvement
    if (pointGain > 0) {
      // Find the option that gives the highest score
      const bestOptionIndex = scoringMap.indexOf(maxScore);
      const suggestedOption = options[bestOptionIndex];
      
      improvements.push({
        questionId,
        currentResponse,
        currentScore,
        suggestedImprovement: suggestedOption,
        potentialScore,
        pointGain,
        reasoning: `Improving from "${currentResponse}" to "${suggestedOption}" would increase your score by ${pointGain} points in this category.`
      });
    }
  }

  // Sort by point gain (highest first) and take top 3
  const topImprovements = improvements
    .sort((a, b) => b.pointGain - a.pointGain)
    .slice(0, 3);

  // Calculate total potential point gain
  const totalPointGain = topImprovements.reduce((sum, improvement) => sum + improvement.pointGain, 0);



  return {
    lowestCategory: lowestCategory[0],
    currentCategoryScore: lowestCategory[1] as number,
    realisticImprovements: topImprovements,
    totalPointGain
  };
}

export async function generateDynamicInsights(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  // Find the highest and lowest scoring categories (exclude overallScore)
  const categoryScores = Object.entries(scores).filter(([key]) => key !== 'overallScore');
  const highestCategory = categoryScores.reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) > (scores[b[0] as keyof typeof scores] as number) ? a : b);
  const lowestCategory = categoryScores.reduce((a, b) => (scores[a[0] as keyof typeof scores] as number) < (scores[b[0] as keyof typeof scores] as number) ? a : b);
  
  // Get realistic improvements analysis
  const improvementsAnalysis = await generateRealisticImprovements(responses, scores, apiKey, industry, location);
  
  // Calculate projected score based on actual improvements
  const currentScore = Object.values(scores).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number;
  const calculatedProjectedScore = currentScore + improvementsAnalysis.totalPointGain;
  const projectedScore = Math.min(100, calculatedProjectedScore);
  
  // Map category names to display names
  const categoryDisplayNames: Record<string, string> = {
    'personalBackground': 'Personal Background',
    'entrepreneurialSkills': 'Entrepreneurial Skills', 
    'resources': 'Resources',
    'behavioralMetrics': 'Behavioral Metrics',
    'growthVision': 'Growth & Vision'
  };
  
  // Map question IDs to their categories
  const questionCategoryMap: Record<string, string> = {
    'q1': 'personalBackground', 'q2': 'personalBackground', 'q3': 'personalBackground',
    'q4': 'personalBackground', 'q5': 'personalBackground',
    'q6': 'entrepreneurialSkills', 'q7': 'entrepreneurialSkills', 'q8': 'entrepreneurialSkills',
    'q9': 'entrepreneurialSkills', 'q10': 'entrepreneurialSkills',
    'q11': 'resources', 'q12': 'resources', 'q13': 'resources', 'q14': 'resources', 'q15': 'resources',
    'q16': 'behavioralMetrics', 'q17': 'behavioralMetrics', 'q18': 'behavioralMetrics',
    'q19': 'behavioralMetrics', 'q20': 'behavioralMetrics',
    'q21': 'growthVision', 'q22': 'growthVision', 'q23': 'growthVision', 'q24': 'growthVision', 'q25': 'growthVision'
  };
  
  // Get responses for the highest and lowest categories
  const highestCategoryResponses = responses.filter(r => questionCategoryMap[r.questionId] === highestCategory[0]);
  const lowestCategoryResponses = responses.filter(r => questionCategoryMap[r.questionId] === lowestCategory[0]);
  
  // Create detailed analysis of responses
  const highestCategoryAnalysis = highestCategoryResponses.map(r => ({
    questionId: r.questionId,
    response: r.response,
    category: questionCategoryMap[r.questionId]
  }));
  
  const lowestCategoryAnalysis = lowestCategoryResponses.map(r => ({
    questionId: r.questionId,
    response: r.response,
    category: questionCategoryMap[r.questionId]
  }));
  
  const prompt = `You are an expert entrepreneurship evaluator analyzing an individual entrepreneur's assessment responses to generate dynamic insights.

IMPORTANT: This assessment evaluates the ENTREPRENEUR/FOUNDER, not the company. Always refer to the individual entrepreneur using "you," "your," or "the entrepreneur" - never "this company," "this entity," or "the business."

Assessment Context:
- Industry: ${industry || 'Creative & Media'}
- Location: ${location || 'Delaware'}
- Current Overall Score: ${currentScore}/100
- Projected Score: ${projectedScore}/100

Highest Scoring Category: ${categoryDisplayNames[highestCategory[0]]} (${highestCategory[1]}/20)
Lowest Scoring Category: ${categoryDisplayNames[lowestCategory[0]]} (${lowestCategory[1]}/20)

Highest Category Responses:
${highestCategoryAnalysis.map(r => `- ${r.questionId}: "${r.response}"`).join('\n')}

Lowest Category Responses:
${lowestCategoryAnalysis.map(r => `- ${r.questionId}: "${r.response}"`).join('\n')}

Realistic Improvements Analysis:
${improvementsAnalysis.realisticImprovements.map((imp: any) => 
  `- ${imp.questionId}: Currently "${imp.currentResponse}" (${imp.currentScore} points) → Suggested "${imp.suggestedImprovement}" (${imp.potentialScore} points) = +${imp.pointGain} points`
).join('\n')}

Generate dynamic insights based on the actual responses and realistic improvements:

1. For Competitive Advantage (highest category): Create 3 specific bullet points based on the actual responses that show the entrepreneur's strengths. Use "you" or "your" language. Do NOT include point values or question numbers in parentheses.
2. For Growth Opportunity (lowest category): Create 3 specific bullet points based on the realistic improvements analysis, focusing on the most impactful changes for the entrepreneur. Use "you" or "your" language. Do NOT include point values or question numbers in parentheses.
3. Projected Score: ${projectedScore}

LANGUAGE RULES:
- Always refer to the individual entrepreneur, not the company
- Use "you," "your," "the entrepreneur," or "the founder"
- NEVER use "this company," "this entity," "the business," or "the organization"
- Focus on personal skills, behaviors, and capabilities

Return as JSON:
{
  "projectedScore": ${projectedScore},
  "competitiveAdvantage": {
    "category": "${categoryDisplayNames[highestCategory[0]]}",
    "score": "${highestCategory[1]}",
    "summary": "1-2 sentence summary about the entrepreneur's strengths based on actual responses",
    "specificStrengths": ["3 specific bullet points about the entrepreneur's strengths - use 'you' language - no points or question numbers"]
  },
  "growthOpportunity": {
    "category": "${categoryDisplayNames[lowestCategory[0]]}",
    "score": "${lowestCategory[1]}",
    "summary": "1-2 sentence summary about the entrepreneur's growth opportunities based on realistic improvements",
    "specificWeaknesses": ["3 specific bullet points about the entrepreneur's growth areas - use 'you' language - no points or question numbers"]
  }
}`;

  const response = await callGemini(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...parsed,
        realisticImprovements: improvementsAnalysis.realisticImprovements,
        totalPointGain: improvementsAnalysis.totalPointGain,
        lowestCategory: improvementsAnalysis.lowestCategory,
        currentCategoryScore: improvementsAnalysis.currentCategoryScore
      };
    }
    
    // If JSON parsing fails, throw an error instead of using fallback text
    throw new Error('Failed to parse AI response for dynamic insights');
    
  } catch (error) {
    throw new Error(`Dynamic insights generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export { callGemini, parseGeminiResponse };
