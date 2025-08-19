/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/v2/https";
import {onCall} from "firebase-functions/v2/https";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {onSchedule} from "firebase-functions/v2/scheduler";
// DEPRECATED: No longer needed as we've switched to ADK agent
// import {defineString} from "firebase-functions/params";
import Stripe from 'stripe';
import * as admin from 'firebase-admin';
import {MailchimpService, EmailData} from './services/MailchimpService';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize Mailchimp service
const mailchimpService = new MailchimpService();

// Define the Gemini API key parameter
// DEPRECATED: Gemini API key no longer needed as we've switched to ADK agent
// const geminiApiKey = defineString("GEMINI_API_KEY");

// DEPRECATED: Scoring prompts no longer needed as we've switched to ADK agent
// const SCORING_PROMPTS = {
//   entrepreneurialJourney: `You are an expert business evaluator assessing a founder's entrepreneurial journey.
// Score this response on a scale of 1-5 where:
// 1 = Vague, lacks structure, no clear direction or milestones
// 3 = Decent clarity with some evidence of execution and progress
// 5 = Well-articulated, structured response with strong execution and clear growth path

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

//   businessChallenge: `You are an expert business evaluator assessing how a founder navigates business challenges.
// Score this response on a scale of 1-5 where:
// 1 = Poor problem definition, reactive approach, no clear solution strategy
// 3 = Clear problem definition, reasonable approach, some evidence of execution
// 5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

//   setbacksResilience: `You are an expert business evaluator assessing a founder's ability to handle setbacks.
// Score this response on a scale of 1-5 where:
// 1 = Poor resilience, gives up easily, no clear recovery strategy
// 3 = Moderate resilience, recovers but slowly, some adaptation
// 5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

//   finalVision: `You are an expert business evaluator assessing a founder's long-term vision.
// Score this response on a scale of 1-5 where:
// 1 = Vague, unrealistic, or very limited vision, no clear roadmap
// 3 = Clear vision with reasonable ambition, some future goals
// 5 = Compelling, ambitious vision with clear roadmap and long-term impact

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`
// };

// DEPRECATED: Gemini response parsing no longer needed as we've switched to ADK agent
// function parseGeminiResponse(response: string): { score: number; explanation: string } {
//   try {
//     // Try to parse as JSON first
//     const jsonMatch = response.match(/\{[\s\S]*\}/);
//     if (jsonMatch) {
//       const parsed = JSON.parse(jsonMatch[0]);
//       return {
//         score: Math.max(1, Math.min(5, Math.round(parsed.score || 3))),
//         explanation: parsed.explanation || 'AI evaluation completed'
//       };
//     }

//     // Fallback: extract score from text
//     const scoreMatch = response.match(/score["\s:]*(\d+)/i);
//     if (!scoreMatch) {
//       throw new Error('Unable to extract score from AI response. Please ensure AI scoring is working properly.');
//     }
//     const score = parseInt(scoreMatch[1]);
//     return {
//       score: Math.max(1, Math.min(5, score)),
//       explanation: response.substring(0, 200) + (response.length > 200 ? '...' : '')
//     };
//   } catch (error) {
//     console.error('Error parsing Gemini response:', error);
//     throw new Error('AI scoring failed. Please ensure AI scoring is working properly.');
//   }
// }

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// DEPRECATED: AI Feedback Generation Function - Replaced by ADK Agent
// This function is no longer used as we've switched to the ADK agent for all AI functionality
// export const generateFeedback = onRequest({ cors: true, invoker: "public" }, async (request, response) => {
//   // Enable CORS
//   response.set('Access-Control-Allow-Origin', '*');
//   response.set('Access-Control-Allow-Methods', 'GET, POST');
//   response.set('Access-Control-Allow-Headers', 'Content-Type');

//   if (request.method === 'OPTIONS') {
//     response.status(204).send('');
//     return;
//   }

//   if (request.method !== 'POST') {
//     response.status(405).json({ error: 'Method not allowed' });
//     return;
//   }

//   try {
//     const { responses, scores, industry, location } = request.body;

//     const apiKey = geminiApiKey.value();
//     if (!apiKey) {
//       response.status(500).json({ error: 'Gemini API key not configured' });
//       return;
//     }

//     // Generate enhanced feedback using the new AI functions with individual error handling
//     let feedback, competitiveAdvantage, growthOpportunity, scoreProjection, comprehensiveAnalysis, nextSteps;
    
//     try {
//       [feedback, competitiveAdvantage, growthOpportunity, scoreProjection, comprehensiveAnalysis, nextSteps] = await Promise.all([
//         generateFeedbackText(responses, scores, apiKey),
//         generateCompetitiveAdvantage(responses, scores, apiKey, industry, location),
//         generateGrowthOpportunity(responses, scores, apiKey, industry, location),
//         generateTruthfulScoreProjection(responses, scores, apiKey, industry, location),
//         generateComprehensiveAnalysis(responses, scores, apiKey, industry, location),
//         generateNextStepsText(scores, apiKey, industry, location)
//       ]);
//     } catch (error) {
//       console.error('Error in Promise.all:', error);
//       // Fallback to individual calls with error handling
//              try {
//          feedback = await generateFeedbackText(responses, scores, apiKey);
//        } catch (e) {
//          console.error('Error generating feedback:', e);
//          feedback = null;
//        }
      
//              try {
//          competitiveAdvantage = await generateCompetitiveAdvantage(responses, scores, apiKey, industry, location);
//        } catch (e) {
//          console.error('Error generating competitive advantage:', e);
//          competitiveAdvantage = null;
//        }
      
//              try {
//          growthOpportunity = await generateGrowthOpportunity(responses, scores, apiKey, industry, location);
//        } catch (e) {
//          console.error('Error generating growth opportunity:', e);
//          growthOpportunity = null;
//        }
      
//              try {
//          scoreProjection = await generateTruthfulScoreProjection(responses, scores, apiKey, industry, location);
//        } catch (e) {
//          console.error('Error generating score projection:', e);
//          scoreProjection = null;
//        }
      
//              try {
//          comprehensiveAnalysis = await generateComprehensiveAnalysis(responses, scores, apiKey, industry, location);
//        } catch (e) {
//          console.error('Error generating comprehensive analysis:', e);
//          comprehensiveAnalysis = null;
//        }
      
//              try {
//          nextSteps = await generateNextStepsText(scores, apiKey, industry, location);
//        } catch (e) {
//          console.error('Error generating next steps:', e);
//          nextSteps = null;
//        }
//     }

//     // Debug logging to see what's being returned
//     console.log('Generated AI feedback:', {
//       feedback: feedback ? 'present' : 'missing',
//       competitiveAdvantage: competitiveAdvantage ? 'present' : 'missing',
//       growthOpportunity: growthOpportunity ? 'present' : 'missing',
//       scoreProjection: scoreProjection ? 'present' : 'missing',
//       comprehensiveAnalysis: comprehensiveAnalysis ? 'present' : 'missing',
//       nextSteps: nextSteps ? 'present' : 'missing'
//     });
    
//     if (comprehensiveAnalysis) {
//       console.log('Comprehensive Analysis length:', comprehensiveAnalysis.length);
//       console.log('Comprehensive Analysis preview:', comprehensiveAnalysis.substring(0, 100) + '...');
//     }

//     response.json({
//       feedback,
//       competitiveAdvantage,
//       growthOpportunity,
//       scoreProjection,
//       comprehensiveAnalysis,
//       nextSteps
//     });

//   } catch (error) {
//     console.error('Error generating feedback:', error);
//     response.status(500).json({
//       error: 'Failed to generate feedback',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });

// DEPRECATED: AI Scoring Function - Replaced by ADK Agent
// export const scoreQuestion = onRequest({ cors: true, invoker: "public" }, async (request, response) => {
//   // Enable CORS
//   response.set('Access-Control-Allow-Origin', '*');
//   response.set('Access-Control-Allow-Methods', 'GET, POST');
//   response.set('Access-Control-Allow-Headers', 'Content-Type');

//   if (request.method === 'OPTIONS') {
//     response.status(204).send('');
//     return;
//   }

//   if (request.method !== 'POST') {
//     response.status(405).json({ error: 'Method not allowed' });
//     return;
//   }

//   try {
//     const { questionType, response: questionResponse } = request.body;

//     if (!questionType || !questionResponse) {
//       response.status(400).json({ error: 'Missing required fields: questionType and response' });
//       return;
//     }

//     const apiKey = geminiApiKey.value();
//     if (!apiKey) {
//       response.status(500).json({ error: 'Gemini API key not configured' });
//       return;
//     }

//     // Get the appropriate prompt for the question type
//     const validQuestionTypes = ['entrepreneurialJourney', 'businessChallenge', 'setbacksResilience', 'finalVision'] as const;
//     if (!validQuestionTypes.includes(questionType as any)) {
//       response.status(400).json({ error: 'Invalid question type' });
//       return;
//     }
    
//     const promptTemplate = SCORING_PROMPTS[questionType as keyof typeof SCORING_PROMPTS];
//     if (!promptTemplate) {
//       response.status(400).json({ error: 'Invalid question type' });
//       return;
//     }

//     // Replace placeholder with actual response
//     const prompt = promptTemplate.replace('{{RESPONSE}}', questionResponse);

//     // Call Gemini API
//     const geminiResponse = await callGemini(prompt, apiKey);
    
//     // Parse the response
//     const scoringResult = parseGeminiResponse(geminiResponse);

//     response.json(scoringResult);

//   } catch (error) {
//     console.error('Error in AI scoring:', error);
//     response.status(500).json({
//       error: 'Failed to score response',
//       details: error instanceof Error ? error.message : 'Unknown error'
//     });
//   }
// });

async function generateFeedbackText(responses: any[], scores: any, apiKey: string): Promise<string> {
  const openEndedResponses = responses.filter((r: any) => 
    r.questionId === 'q3' || r.questionId === 'q8' || r.questionId === 'q18' || r.questionId === 'q23'
  );

  const prompt = `You are an expert entrepreneurship coach and evaluator. Your role is to provide supportive, specific, and encouraging feedback based on a founder's responses to four key questions:
Vision Statement
Entrepreneurial Journey
Business Challenge
Setback Response

🔍 Output Guidelines
Write a short feedback paragraph (3–4 sentences) that includes:
One clear strength observed across the answers
One specific area for improvement
One actionable next step
Tone: Warm, thoughtful, growth-oriented—like a mentor who believes in the founder's potential.
Format: Plain text only
Do NOT include JSON
Do NOT re-state the input answers
Do NOT exceed 120 words
Do NOT use hashtags, markdown, emojis, or formatting

✅ Example Output:
You've clearly thought deeply about your business and your purpose shines through. Your biggest opportunity lies in building a stronger support network to avoid burnout. Consider joining a local founder peer group or incubator to get the mentorship and accountability that will help you grow faster.

This feedback should feel like it came from someone who read carefully, believes in them, and wants to see them win. No fluff. No jargon. No generic compliments. Just real insight.

OPEN-ENDED RESPONSES:
${openEndedResponses.map((r: any) => `
Question: ${r.questionText}
Response: ${r.response}
`).join('\n')}`;

  return await callGemini(prompt, apiKey);
}





// Enhanced AI feedback generation functions
async function generateCompetitiveAdvantage(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const prompt = `You are an expert business analyst identifying competitive advantages.

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
- Industry: ${industry || 'Not specified'}
- Location: ${location || 'Not specified'}

TASK: Analyze the highest-scoring category and identify specific competitive advantages.

OUTPUT FORMAT (JSON):
{
  "category": "Resources & Network",
  "score": "17/20",
  "summary": "Your execution capabilities put you in the top 28% of tech entrepreneurs in Colorado.",
  "specificStrengths": [
    "Strategic problem-solving approach (demonstrates handling cash flow crisis)",
    "Strong network utilization (leveraged friend's support effectively)",
    "Growth mindset (weekly professional learning commitment)",
    "Resilience and adaptability (bounced back from business challenges)"
  ]
}

EXAMPLE SPECIFIC BULLETS:
- "Strategic problem-solving approach (demonstrates handling cash flow crisis)"
- "Strong network utilization (leveraged friend's support effectively)"
- "Growth mindset (weekly professional learning commitment)"
- "Resilience and adaptability (bounced back from business challenges)"

AVOID GENERIC BULLETS LIKE:
- "Strong foundation in business fundamentals"
- "Demonstrated problem-solving abilities"
- "Commitment to continuous learning"
- "Resilient approach to challenges"

INSTRUCTIONS:
- Identify the highest-scoring category
- Analyze specific responses in that category to find evidence of strengths
- Create 4 specific, evidence-based strengths from their actual responses
- Each strength MUST include specific details from their responses (e.g., "Strategic problem-solving approach (demonstrates handling cash flow crisis)")
- Make each strength specific and actionable with concrete examples
- Focus on competitive advantages that set them apart from other entrepreneurs
- Include regional/industry context if available
- Avoid generic phrases like "strong foundation" or "demonstrated abilities"
- Use specific examples, numbers, or concrete actions from their responses
- Each bullet should feel like it came from analyzing their actual answers, not generic advice`;

  const response = await callGemini(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error parsing competitive advantage response:', error);
    // Fallback to basic strengths
    return {
      category: "Resources & Network",
      score: "17/20",
      summary: "Your execution capabilities show strong potential for growth.",
      specificStrengths: [
        "Business experience (previous attempts show learning mindset)",
        "Network connections (leveraged support systems effectively)",
        "Learning commitment (regular professional development activities)",
        "Adaptability (successfully navigated business challenges)"
      ]
    };
  }
}

async function generateGrowthOpportunity(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const prompt = `You are an expert business coach identifying growth opportunities.

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
- Industry: ${industry || 'Not specified'}
- Location: ${location || 'Not specified'}

TASK: Analyze the lowest-scoring category and provide specific improvement insights.

OUTPUT FORMAT (JSON):
{
  "category": "Entrepreneurial Skills",
  "score": "15/25",
  "summary": "Inconsistent habits are holding you back from reaching your full potential.",
  "specificWeaknesses": [
    "Goal tracking happens 'occasionally' vs systematic approach",
    "Time dedication varies (1-10 hours) without structure",
    "Recovery from setbacks relies on resilience vs strategic planning",
    "Business planning lacks formal processes and documentation"
  ]
}

EXAMPLE SPECIFIC BULLETS:
- "Goal tracking happens 'occasionally' vs systematic approach"
- "Time dedication varies (1-10 hours) without structure"
- "Recovery from setbacks relies on resilience vs strategic planning"
- "Business planning lacks formal processes and documentation"

AVOID GENERIC BULLETS LIKE:
- "Goal tracking could be more systematic"
- "Time management needs more structure"
- "Business planning processes could be formalized"
- "Strategic thinking could be enhanced"

INSTRUCTIONS:
- Identify the lowest-scoring category
- Analyze specific responses in that category to find evidence of weaknesses
- Create 4 specific, evidence-based weaknesses from their actual responses
- Each weakness MUST include specific details from their responses (e.g., "Goal tracking happens 'occasionally' vs systematic approach")
- Make each weakness specific and actionable with concrete examples
- Focus on areas that can be realistically improved
- Be constructive but honest about gaps
- Avoid generic phrases like "could be more systematic" or "needs more structure"
- Use specific examples, numbers, or concrete actions from their responses
- Each bullet should feel like it came from analyzing their actual answers, not generic advice
- Include the actual words/phrases they used in their responses`;

  const response = await callGemini(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error parsing growth opportunity response:', error);
    // Fallback to basic weaknesses
    return {
      category: "Entrepreneurial Skills",
      score: "15/25",
      summary: "There are opportunities to strengthen your entrepreneurial foundation.",
      specificWeaknesses: [
        "Goal tracking frequency (currently 'occasionally' vs weekly)",
        "Time allocation (varies without consistent structure)",
        "Planning processes (informal vs documented approach)",
        "Strategic execution (reactive vs proactive planning)"
      ]
    };
  }
}

async function generateComprehensiveAnalysis(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const overallScore = Object.values(scores).reduce((sum: number, score: any) => sum + (score as number), 0);
  
  // Determine star rating and label based on the correct thresholds
  let starRating: number;
  let starLabel: string;
  
  if (overallScore >= 90) {
    starRating = 5;
    starLabel = "Transformative Trajectory";
  } else if (overallScore >= 80) {
    starRating = 4;
    starLabel = "Established Signals";
  } else if (overallScore >= 65) {
    starRating = 3;
    starLabel = "Emerging Traction";
  } else if (overallScore >= 50) {
    starRating = 2;
    starLabel = "Forming Potential";
  } else {
    starRating = 1;
    starLabel = "Early Spark";
  }

  const prompt = `You are a seasoned entrepreneurial scout, analyzing the signals from a founder's Gutcheck Assessment the way an NFL scout would evaluate a player's combine results and tape. Your role is not to prescribe or judge, but to surface signals, tendencies, and overlooked strengths/risks that help explain where this entrepreneur sits on their trajectory.

ASSESSMENT DATA:
${responses.map((r: any) => `
Question ${r.questionId}: ${r.questionText}
Response: ${r.response}
`).join('\n')}

CURRENT SCORES:
- Overall Score: ${overallScore}/100
- Personal Background: ${scores.personalBackground}/20
- Entrepreneurial Skills: ${scores.entrepreneurialSkills}/25
- Resources & Network: ${scores.resources}/20
- Behavioral Metrics: ${scores.behavioralMetrics}/15
- Growth & Vision: ${scores.growthVision}/20
- Star Rating: ${starRating}/5 (${starLabel})
- Industry: ${industry || 'Not specified'}
- Location: ${location || 'Not specified'}

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
- Make it feel personalized and authentic`;

  return await callGemini(prompt, apiKey);
}

async function generateTruthfulScoreProjection(responses: any[], scores: any, apiKey: string, industry?: string, location?: string): Promise<any> {
  const overallScore = Object.values(scores).reduce((sum: number, score: any) => sum + (score as number), 0);
  
  const prompt = `You are an expert business consultant calculating realistic score improvements.

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
1. Identify the lowest-scoring category (Biggest Growth Opportunity)
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
- Only suggest improvements that are realistically achievable
- Base projections on actual response changes, not hypothetical scenarios
- Be conservative - under-promise and over-deliver
- Focus on the lowest-scoring category first
- Provide specific, actionable recommendations`;

  const response = await callGemini(prompt, apiKey);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('No JSON found in response');
  } catch (error) {
    console.error('Error parsing score projection response:', error);
    // Fallback to conservative estimate
    return {
      currentScore: overallScore,
      projectedScore: Math.min(100, (overallScore as number) + 3),
      improvementPotential: 3,
      analysis: {
        lowestCategory: "Unknown",
        currentCategoryScore: 0,
        realisticImprovements: [],
        totalPointGain: 3
      }
    };
  }
}

async function generateNextStepsText(scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
      const prompt = `You are an expert business evaluator using Gutcheck.AI results to recommend actionable next steps for entrepreneurs.

Your output must include:
One mentorship program or community
One funding or grant opportunity
One learning resource (course, article, or book)

Personal Foundation Score (0–20): ${scores.personalBackground}
Entrepreneurial Skills Score (0–25): ${scores.entrepreneurialSkills}
Resources Score (0–20): ${scores.resources}
Behavioral Metrics Score (0–15): ${scores.behavioralMetrics}
Growth & Vision Score (0–20): ${scores.growthVision}
Industry: ${industry || 'Not specified'}
Location: ${location || 'Not specified'}

🔍 Step-by-Step Logic
Identify the lowest-scoring category → this defines the area of focus.
Based on that category and the founder's industry/location:
Mentorship: Suggest a local or niche online program accepting new participants. Verify that it's active.
Funding: Find a grant or tool with a working link specific to the founder's geography or sector.
Learning: Recommend a course, article, or book from reputable platforms like Coursera, Udemy, Amazon, or Medium. Ensure recency and relevance.

📋 Output Format (Plain Text Only)
Use this exact format: Mentorship: [Resource Name] (specific-url.com) Funding: [Resource Name] (specific-url.com) Learning: [Resource Name] (specific-url.com)
Each line must be:
Max 300 characters
Include working URLs that lead directly to the specific resource mentioned
No emojis, hashtags, markdown, bullet points, or extra styling

✅ Example:
Mentorship: Delaware Innovation Space (delawareinnovationspace.com/apply)
Funding: Delaware Division of the Arts Grant (arts.delaware.gov/grants/apply)
Learning: Coursera's "Creative Entrepreneurship" (coursera.org/learn/creative-entrepreneurship)

⛔ CRITICAL: The URL must lead directly to the specific resource, not a general category page.

⛔ HARD RULES
You must verify that all links are current, accessible, and contextually relevant.
Never suggest generic platforms like Y Combinator unless they are industry-specific and open.
If local resources aren't available, use national ones that serve the founder's profile.
Your tone should feel like a helpful coach—confident, supportive, and focused on making the founder feel seen and set up to act.

🧪 URL VALIDATION REQUIREMENT:
Only suggest resources where you can provide a specific, direct URL that you know exists:
- Use well-known, established resources with predictable URL structures
- For books: Use Amazon, Goodreads, or publisher direct links
- For courses: Use direct course URLs from Coursera, Udemy, etc.
- For grants: Use specific grant application pages from government/org websites
- For mentorship: Use specific chapter/contact pages from established organizations
- If you cannot provide a specific, working URL, suggest a different resource

🔗 URL REQUIREMENTS:
- For "Creative Capital Award" → find the actual application page, not just creative-capital.org
- For "The Business of Creativity" book → find the Amazon/Goodreads page, not just a general bookstore
- For "SCORE Mentors Atlanta" → find the Atlanta chapter page, not just score.org
- URLs must be specific and actionable, leading directly to the resource mentioned

✅ URL VALIDATION REQUIRED:
Only suggest resources where you can provide a specific, direct URL:
1. Use established platforms with predictable URL structures
2. Ensure the URL leads directly to the specific resource mentioned
3. If you cannot provide a specific URL for a resource, suggest a different, verifiable resource
4. Prefer resources from major platforms (Amazon, Coursera, government sites, etc.) where URLs are reliable

🔍 URL TESTING PROCESS:
After generating your response, I will test each URL to verify:
- The URL is accessible (returns HTTP 200)
- The page content contains the resource name you suggested
- If validation fails, I will regenerate the response with different resources

⛔ NO GENERIC FALLBACKS:
- Do not suggest "sba.gov/funding-programs" for specific grants
- Do not suggest "coursera.org/entrepreneurship" for specific courses
- Do not suggest "score.org" for specific local chapters
- Only suggest resources where you can provide a direct, working URL`;

  let response = await callGemini(prompt, apiKey);
  
  // Extract URLs from the response and validate them
  const lines = response.split('\n');
  let needsRegeneration = false;
  
  for (const line of lines) {
    const urlMatch = line.match(/\(([^)]+\.(?:org|com|edu|gov|net))\)/);
    if (urlMatch) {
      const url = urlMatch[1].startsWith('http') ? urlMatch[1] : `https://${urlMatch[1]}`;
      const resourceName = line.replace(/^[^:]+:\s*/, '').replace(/\s*\([^)]+\)$/, '').trim();
      
      console.log(`Validating URL: ${url} for resource: ${resourceName}`);
      
      // Test URL accessibility
      const urlValidation = await validateUrl(url);
      if (!urlValidation.isValid) {
        console.log(`URL validation failed for ${url}: ${urlValidation.error}`);
        needsRegeneration = true;
        break;
      }
      
      // Test URL content relevance
      const contentValidation = await validateUrlContent(url, resourceName);
      if (!contentValidation.matches) {
        console.log(`Content validation failed for ${url}: ${contentValidation.reason}`);
        needsRegeneration = true;
        break;
      }
      
      console.log(`✅ URL validation passed for ${url}`);
    }
  }
  
  // If validation failed, regenerate with a more strict prompt
  if (needsRegeneration) {
    console.log('URL validation failed, regenerating with stricter requirements...');
    const strictPrompt = prompt + '\n\n🚨 CRITICAL: The previous response failed URL validation. Only suggest resources from major, well-known platforms where you are 100% certain the specific URL exists and is accessible.';
    response = await callGemini(strictPrompt, apiKey);
  }
  
  return response;
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Invalid response from Gemini API');
    }

    return responseText.trim();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out after 30 seconds');
    }
    throw error;
  }
}

// Add URL validation function
async function validateUrl(url: string): Promise<{ isValid: boolean; status?: number; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'HEAD', // Only fetch headers, not full content
    });
    
    return {
      isValid: response.ok,
      status: response.status
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Add URL content validation function
async function validateUrlContent(url: string, expectedResource: string): Promise<{ matches: boolean; reason?: string }> {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      return { matches: false, reason: `HTTP ${response.status}` };
    }
    
    const text = await response.text();
    const lowerText = text.toLowerCase();
    const lowerResource = expectedResource.toLowerCase();
    
    // Check if the resource name appears in the page content
    const resourceWords = lowerResource.split(' ').filter(word => word.length > 3);
    const matches = resourceWords.some(word => lowerText.includes(word));
    
    return {
      matches,
      reason: matches ? 'Content matches' : 'Resource name not found in page content'
    };
  } catch (error) {
    return {
      matches: false,
      reason: error instanceof Error ? error.message : 'Fetch error'
    };
  }
}

// Token Economy Functions

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create Stripe checkout session for token purchase
export const createTokenCheckoutSession = onCall(async (request) => {
  try {
    const { packageId, tokens, price, userId } = request.data;

    if (!packageId || !tokens || !price || !userId) {
      throw new Error('Missing required fields');
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tokens} Gutcheck Tokens`,
              description: `Token package for Gutcheck.AI features`,
              metadata: {
                packageId,
                tokens: tokens.toString(),
                userId
              }
            },
            unit_amount: Math.round(price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?canceled=true`,
      metadata: {
        packageId,
        tokens: tokens.toString(),
        userId,
        type: 'token_purchase'
      },
      customer_email: userId, // You might want to get the actual email from the user
    });

    return { sessionId: session.id };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new Error('Failed to create checkout session');
  }
});

// Process Stripe webhook for token purchases
export const processStripeWebhook = onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig as string, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    res.status(400).send('Invalid signature');
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Webhook processing failed');
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('Processing completed checkout session:', session.id);

  // Extract metadata
  const metadata = session.metadata;
  if (!metadata || metadata.type !== 'token_purchase') {
    console.log('Not a token purchase session');
    return;
  }

  const userId = metadata.userId;
  const tokens = parseInt(metadata.tokens || '0');
  const packageId = metadata.packageId;

  if (!userId || !tokens || !packageId) {
    console.error('Missing required metadata for token purchase');
    return;
  }

  // Here you would integrate with your token service
  // For now, we'll just log the successful purchase
  console.log(`Successfully processed token purchase: ${tokens} tokens for user ${userId}`);
  
  // TODO: Implement token crediting logic
  // await tokenService.addTokensToUser(userId, tokens, 'stripe', session.payment_intent as string);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);
}

// Token Management Functions

// Get user token info
export const getUserTokenInfo = onCall(async (request) => {
  try {
    const { userId, includeTransactionHistory } = request.data;

    if (!userId) {
      throw new Error('Missing userId parameter');
    }

    // Get token balance from Firestore
    const balanceRef = admin.firestore().collection('tokenBalances').doc(userId);
    const balanceDoc = await balanceRef.get();
    
    let tokenBalance = 0;
    if (balanceDoc.exists) {
      const data = balanceDoc.data();
      tokenBalance = data?.balance || 0;
    } else {
      // Create initial token balance if it doesn't exist
      await balanceRef.set({
        userId: userId,
        balance: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Get feature access from Firestore
    const accessRef = admin.firestore().collection('featureAccess').doc(userId);
    const accessDoc = await accessRef.get();
    
    let featureAccess = {
      'ai-market-analysis': false,
      'investor-matching': false,
      'competitor-report': false,
      'team-analysis': false,
      'pitch-deck-ai': false,
      'growth-projections': false,
    };
    
    if (accessDoc.exists) {
      const data = accessDoc.data();
      featureAccess = data?.features || featureAccess;
    } else {
      // Create initial feature access if it doesn't exist
      await accessRef.set({
        userId: userId,
        features: featureAccess,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // Get transaction history if requested
    let transactionHistory = undefined;
    if (includeTransactionHistory) {
      const transactionsRef = admin.firestore().collection('tokenTransactions');
      const transactionsQuery = transactionsRef
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10);
      
      const transactionsSnapshot = await transactionsQuery.get();
      transactionHistory = transactionsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          type: data.type,
          amount: data.amount,
          description: data.description,
          timestamp: data.timestamp.toDate(),
          balanceAfter: data.balanceAfter
        };
      });
    }

    return {
      success: true,
      tokenBalance,
      featureAccess,
      transactionHistory
    };
  } catch (error) {
    console.error('Error getting user token info:', error);
    throw new Error('Failed to get user token info');
  }
});

// Spend tokens for feature unlock
export const spendTokensForFeature = onCall(async (request) => {
  try {
    const { userId, featureName } = request.data;

    if (!userId || !featureName) {
      throw new Error('Missing required fields');
    }

    const db = admin.firestore();
    const batch = db.batch();

    // Get current token balance
    const balanceRef = db.collection('tokenBalances').doc(userId);
    const balanceDoc = await balanceRef.get();
    
    if (!balanceDoc.exists) {
      throw new Error('User has no token balance');
    }
    
    const balanceData = balanceDoc.data();
    const currentBalance = balanceData?.balance || 0;
    
    // Define feature costs
    const featureCosts: Record<string, number> = {
      'ai-market-analysis': 50,
      'investor-matching': 75,
      'competitor-report': 60,
      'team-analysis': 40,
      'pitch-deck-ai': 80,
      'growth-projections': 65
    };
    
    const cost = featureCosts[featureName];
    if (!cost) {
      throw new Error('Invalid feature name');
    }
    
    if (currentBalance < cost) {
      throw new Error('Insufficient token balance');
    }
    
    const newBalance = currentBalance - cost;
    
    // Update token balance
    batch.update(balanceRef, {
      balance: newBalance,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create transaction record
    const transactionRef = db.collection('tokenTransactions').doc();
    batch.set(transactionRef, {
      id: transactionRef.id,
      userId: userId,
      type: 'spend',
      amount: -cost,
      featureName: featureName,
      description: `Unlocked ${featureName}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      balanceAfter: newBalance
    });
    
    // Update feature access
    const accessRef = db.collection('featureAccess').doc(userId);
    batch.update(accessRef, {
      [`features.${featureName}`]: true,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });
    
    await batch.commit();
    
    return {
      success: true,
      newBalance,
      featureUnlocked: true
    };
  } catch (error) {
    console.error('Error spending tokens:', error);
    throw new Error('Failed to unlock feature');
  }
});

// DEPRECATED: AI Scoring Function - Replaced by ADK Agent
// This function is no longer used as we've switched to the ADK agent for all AI functionality
// export const scoreResponse = onCall(async (request) => {
//   try {
//     const { questionType, response } = request.data;

//     if (!questionType || !response) {
//       throw new Error('Missing required fields: questionType and response');
//     }

//     const apiKey = process.env.GEMINI_API_KEY;
//     if (!apiKey) {
//       throw new Error('Gemini API key not configured');
//     }

//     // Prompts from the framework
//     const SCORING_PROMPTS = {
//       entrepreneurialJourney: `You are an expert business evaluator assessing a founder's entrepreneurial journey.
// Score this response on a scale of 1-5 where:
// 1 = Vague, lacks structure, no clear direction or milestones
// 3 = Decent clarity with some evidence of execution and progress
// 5 = Well-articulated, structured response with strong execution and clear growth path

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

//       businessChallenge: `You are an expert business evaluator assessing how a founder navigates business challenges.
// Score this response on a scale of 1-5 where:
// 1 = Poor problem definition, reactive approach, no clear solution strategy
// 3 = Clear problem definition, reasonable approach, some evidence of execution
// 5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

//       setbacksResilience: `You are an expert business evaluator assessing a founder's ability to handle setbacks.
// Score this response on a scale of 1-5 where:
// 1 = Poor resilience, gives up easily, no clear recovery strategy
// 3 = Moderate resilience, recovers but slowly, some adaptation
// 5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

//       finalVision: `You are an expert business evaluator assessing a founder's long-term vision.
// Score this response on a scale of 1-5 where:
// 1 = Vague, unrealistic, or very limited vision, no clear roadmap
// 3 = Clear vision with reasonable ambition, some future goals
// 5 = Compelling, ambitious vision with clear roadmap and long-term impact

// Founder's Response:
// {{RESPONSE}}

// Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`
//     };

//     // Get the appropriate prompt for the question type
//     const promptTemplate = SCORING_PROMPTS[questionType as keyof typeof SCORING_PROMPTS];
//     if (!promptTemplate) {
//       throw new Error('Invalid question type');
//     }

//     // Replace placeholder with actual response
//     const prompt = promptTemplate.replace('{{RESPONSE}}', response);

//     // Call Gemini API
//     const geminiResponse = await callGemini(prompt, apiKey);
    
//     // Parse the response
//     const scoringResult = parseGeminiResponse(geminiResponse);

//     return {
//       success: true,
//       ...scoringResult
//     };

//   } catch (error) {
//     console.error('Error in AI scoring:', error);
//     throw new Error('Failed to score response');
//   }
// });

// Claim Score Function
export const claimScore = onCall(async (request) => {
  try {
    const { sessionId, userId } = request.data;

    if (!sessionId || !userId) {
      throw new Error('Session ID and User ID are required');
    }

    // TODO: Implement actual assessment repository integration
    // For now, return mock success
    return {
      success: true,
      message: 'Score claimed successfully'
    };
  } catch (error) {
    console.error('Error claiming score:', error);
    throw new Error('Failed to claim score');
  }
});

// Email Trigger Functions

/**
 * Send results email when assessment is completed
 */
export const sendResultsEmail = onDocumentCreated(
  'assessment_results/{docId}',
  async (event) => {
    try {
      const assessmentData = event.data?.data();
      if (!assessmentData) {
        console.error('No assessment data found');
        return;
      }

      console.log('Assessment completed, preparing results email:', assessmentData.sessionId);

      // Get user data if available
      let userData = null;
      if (assessmentData.userId) {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(assessmentData.userId)
          .get();
        userData = userDoc.data();
      }

      // Prepare email data
      const emailData: EmailData = {
        email: assessmentData.email || userData?.email,
        firstName: userData?.firstName || assessmentData.firstName || 'Entrepreneur',
        lastName: userData?.lastName || assessmentData.lastName || '',
        gutcheckScore: assessmentData.overallScore,
        starRating: calculateStarRating(assessmentData.overallScore),
        starLabel: getStarLabel(assessmentData.overallScore),
        topStrength: getTopStrength(assessmentData.scores),
        areaForGrowth: getAreaForGrowth(assessmentData.scores),
        scoutAnalysis: assessmentData.geminiFeedback?.recommendation || '',
        assessmentId: assessmentData.sessionId,
        userId: assessmentData.userId || ''
      };

      // Send results email
      const campaignId = await mailchimpService.sendResultsEmail(emailData);

      // Log the email event
      await admin.firestore().collection('email_events').add({
        userId: assessmentData.userId || '',
        emailType: 'results',
        eventType: 'sent',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        assessmentId: assessmentData.sessionId,
        mailchimpMessageId: campaignId
      });

      console.log(`Results email sent successfully for assessment ${assessmentData.sessionId}`);

    } catch (error) {
      console.error('Error sending results email:', error);
      // Don't throw - we don't want to break the assessment flow
    }
  }
);

/**
 * Send follow-up sequence emails (scheduled)
 */
export const sendFollowUpSequence = onSchedule({
  schedule: '0 10 * * *', // Daily at 10 AM
  timeZone: 'America/New_York'
}, async (event) => {
  try {
    console.log('Running follow-up sequence scheduler');

    // Get users who completed assessment 3 days ago
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const assessments = await admin.firestore()
      .collection('assessment_results')
      .where('createdAt', '>=', threeDaysAgo)
      .where('createdAt', '<', new Date(threeDaysAgo.getTime() + 24 * 60 * 60 * 1000))
      .get();

    for (const doc of assessments.docs) {
      const assessmentData = doc.data();
      
      // Check if follow-up 1 was already sent
      const existingEmail = await admin.firestore()
        .collection('email_events')
        .where('assessmentId', '==', assessmentData.sessionId)
        .where('emailType', '==', 'followup_1')
        .get();

      if (!existingEmail.empty) {
        continue; // Already sent
      }

      // Get user data
      let userData = null;
      if (assessmentData.userId) {
        const userDoc = await admin.firestore()
          .collection('users')
          .doc(assessmentData.userId)
          .get();
        userData = userDoc.data();
      }

      // Prepare email data for follow-up 1
      const emailData: EmailData = {
        email: assessmentData.email || userData?.email,
        firstName: userData?.firstName || assessmentData.firstName || 'Entrepreneur',
        lastName: userData?.lastName || assessmentData.lastName || '',
        gutcheckScore: assessmentData.overallScore,
        starRating: calculateStarRating(assessmentData.overallScore),
        starLabel: getStarLabel(assessmentData.overallScore),
        topStrength: getTopStrength(assessmentData.scores),
        areaForGrowth: getAreaForGrowth(assessmentData.scores),
        scoutAnalysis: assessmentData.geminiFeedback?.recommendation || '',
        assessmentId: assessmentData.sessionId,
        userId: assessmentData.userId || ''
      };

      // Send follow-up email
      await mailchimpService.sendFollowUpEmail(emailData, 1);

      console.log(`Follow-up 1 sent for assessment ${assessmentData.sessionId}`);

    }

  } catch (error) {
    console.error('Error in follow-up sequence scheduler:', error);
  }
});

/**
 * Mailchimp webhook handler
 */
export const mailchimpWebhook = onRequest(async (req, res) => {
  try {
    // Verify webhook signature (implement for production)
    // const signature = req.headers['x-mailchimp-signature'];
    
    const eventData = req.body;
    console.log('Mailchimp webhook received:', eventData);

    // Handle different webhook events
    switch (eventData.type) {
      case 'subscribe':
      case 'unsubscribe':
      case 'profile':
        // Handle subscription changes
        break;
      
      case 'campaign':
        // Handle campaign events (sent, opened, clicked)
        await mailchimpService.handleWebhookEvent(eventData);
        break;
      
      default:
        console.log(`Unhandled webhook event type: ${eventData.type}`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error processing Mailchimp webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

/**
 * Test Mailchimp connection
 */
export const testMailchimpConnection = onCall(async (request) => {
  try {
    const isConnected = await mailchimpService.ping();
    const audienceInfo = await mailchimpService.getAudienceInfo();
    
    return {
      success: true,
      connected: isConnected,
      audience: {
        id: audienceInfo.id,
        name: audienceInfo.name,
        member_count: audienceInfo.stats.member_count
      }
    };
  } catch (error) {
    console.error('Error testing Mailchimp connection:', error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
});

// Helper functions

/**
 * Calculate star rating based on score (35-100 scale)
 */
function calculateStarRating(score: number): number {
  // Map overall score to 1-5 stars using Gutcheck thresholds
  if (score >= 90) return 5; // Transformative Trajectory
  if (score >= 80) return 4; // Established Signals
  if (score >= 65) return 3; // Emerging Traction
  if (score >= 50) return 2; // Forming Potential
  return 1; // Early Spark (35-49)
}

/**
 * Get star label based on score (35-100 scale)
 */
function getStarLabel(score: number): string {
  // Labels aligned with UI thresholds in results report
  if (score >= 90) return 'Transformative Trajectory';
  if (score >= 80) return 'Established Signals';
  if (score >= 65) return 'Emerging Traction';
  if (score >= 50) return 'Forming Potential';
  return 'Early Spark';
}

/**
 * Get top strength category
 */
function getTopStrength(scores: any): string {
  const categories = [
    { name: 'Personal Background', score: scores.personalBackground },
    { name: 'Entrepreneurial Skills', score: scores.entrepreneurialSkills },
    { name: 'Resources', score: scores.resources },
    { name: 'Behavioral Metrics', score: scores.behavioralMetrics },
    { name: 'Growth & Vision', score: scores.growthVision }
  ];

  const topCategory = categories.reduce((prev, current) => 
    (prev.score > current.score) ? prev : current
  );

  return topCategory.name;
}

/**
 * Get area for growth
 */
function getAreaForGrowth(scores: any): string {
  const categories = [
    { name: 'Personal Background', score: scores.personalBackground },
    { name: 'Entrepreneurial Skills', score: scores.entrepreneurialSkills },
    { name: 'Resources', score: scores.resources },
    { name: 'Behavioral Metrics', score: scores.behavioralMetrics },
    { name: 'Growth & Vision', score: scores.growthVision }
  ];

  const lowestCategory = categories.reduce((prev, current) => 
    (prev.score < current.score) ? prev : current
  );

  return lowestCategory.name;
}
