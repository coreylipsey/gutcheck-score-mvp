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
import {defineString} from "firebase-functions/params";

// Define the Gemini API key parameter
const geminiApiKey = defineString("GEMINI_API_KEY");

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

// AI Feedback Generation Function
export const generateFeedback = onRequest({ cors: true, invoker: "public" }, async (request, response) => {
  // Enable CORS
  response.set('Access-Control-Allow-Origin', '*');
  response.set('Access-Control-Allow-Methods', 'GET, POST');
  response.set('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { responses, scores, industry, location } = request.body;

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      response.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    // Generate feedback using the same logic as the API route
    const [feedback, strengths, focusAreas, nextSteps] = await Promise.all([
      generateFeedbackText(responses, scores, apiKey),
      generateStrengthsText(scores, apiKey, industry, location),
      generateFocusAreasText(scores, apiKey, industry, location),
      generateNextStepsText(scores, apiKey, industry, location)
    ]);

    response.json({
      feedback,
      strengths,
      focusAreas,
      nextSteps
    });

  } catch (error) {
    console.error('Error generating feedback:', error);
    response.status(500).json({
      error: 'Failed to generate feedback',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

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

async function generateStrengthsText(scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const prompt = `You are an expert business evaluator analyzing Gutcheck Score™ results. Your job is to identify a founder's top strength based on their assessment scores and provide a short, actionable insight.

Personal Background Score (0–20): ${scores.personalBackground}
Entrepreneurial Skills Score (0–25): ${scores.entrepreneurialSkills}
Resources Score (0–20): ${scores.resources}
Behavioral Metrics Score (0–15): ${scores.behavioralMetrics}
Growth & Vision Score (0–20): ${scores.growthVision}
Industry: ${industry || 'Not specified'}
Location: ${location || 'Not specified'}

🔍 Instructions for Response Formatting
Select the highest-scoring category from the five Gutcheck Score areas.
Write a single response (max 200 characters) that:
Clearly states the founder's strength area
Includes a brief, encouraging insight + one actionable tip
Tone: Supportive, insightful, and practical. Avoid jargon.
Format: Plain text only. Do NOT use hashtags, bullet points, emojis, markdown, or decorative characters.

✅ Example:
"Your highest score is in Entrepreneurial Skills. Your strong foundation in financial literacy and learning habits suggests you're ready to accelerate growth through smart execution."
If the scores are tied, choose the category most aligned with their listed industry.`;

  return await callGemini(prompt, apiKey);
}

async function generateFocusAreasText(scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const prompt = `You are an expert business evaluator analyzing Gutcheck Score™ results to identify improvement areas.

Personal Background Score (0–20): ${scores.personalBackground}
Entrepreneurial Skills Score (0–25): ${scores.entrepreneurialSkills}
Resources Score (0–20): ${scores.resources}
Behavioral Metrics Score (0–15): ${scores.behavioralMetrics}
Growth & Vision Score (0–20): ${scores.growthVision}
Industry: ${industry || 'Not specified'}
Location: ${location || 'Not specified'}

🔍 Instructions for Response Formatting
Identify the lowest-scoring category from the five Gutcheck Score areas.
Write a single response (max 200 characters) that:
Clearly names the improvement area
Offers a short, encouraging explanation with a practical next step
Tone: Constructive, positive, growth-minded.
Format: Plain text only. Do NOT include hashtags, bullet points, emojis, markdown, or decorative symbols.

✅ Example:
"Your lowest score is in Behavioral Metrics. Improving how consistently you track goals could boost your execution—try setting weekly review blocks to stay on track."
If scores are tied, highlight the category most relevant to their industry or most foundational to success.`;

  return await callGemini(prompt, apiKey);
}

async function generateNextStepsText(scores: any, apiKey: string, industry?: string, location?: string): Promise<string> {
  const prompt = `You are an expert business evaluator using Gutcheck Score™ results to recommend actionable next steps for entrepreneurs.

Your output must include:
One mentorship program or community
One funding or grant opportunity
One learning resource (course, article, or book)

Personal Background Score (0–20): ${scores.personalBackground}
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
Use this exact format: Mentorship: [Resource Name] https://[url] Funding: [Resource Name] https://[url] Learning: [Resource Name] https://[url]
Each line must be:
Max 300 characters
Include working URLs for all resources
No emojis, hashtags, markdown, bullet points, or extra styling

✅ Example:
Mentorship: Delaware Innovation Space https://www.delawareinnovationspace.com
Funding: Delaware Division of the Arts Grant https://arts.delaware.gov/grants
Learning: Coursera's "Creative Entrepreneurship" https://www.coursera.org/learn/creative-entrepreneurship

⛔ HARD RULES
You must verify that all links are current, accessible, and contextually relevant.
Never suggest generic platforms like Y Combinator unless they are industry-specific and open.
If local resources aren't available, use national ones that serve the founder's profile.
Your tone should feel like a helpful coach—confident, supportive, and focused on making the founder feel seen and set up to act.`;

  return await callGemini(prompt, apiKey);
}

async function callGemini(prompt: string, apiKey: string): Promise<string> {
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
      })
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!responseText) {
    throw new Error('Invalid response from Gemini API');
  }

  return responseText.trim();
}
