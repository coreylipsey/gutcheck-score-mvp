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
import {defineString} from "firebase-functions/params";
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Define the Gemini API key parameter
const geminiApiKey = defineString("GEMINI_API_KEY");

// Scoring prompts from the framework
const SCORING_PROMPTS = {
  entrepreneurialJourney: `You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response on a scale of 1-5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

  businessChallenge: `You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response on a scale of 1-5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

  setbacksResilience: `You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response on a scale of 1-5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

  finalVision: `You are an expert business evaluator assessing a founder's long-term vision.
Score this response on a scale of 1-5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`
};

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

// AI Scoring Function
export const scoreQuestion = onRequest({ cors: true, invoker: "public" }, async (request, response) => {
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
    const { questionType, response: questionResponse } = request.body;

    if (!questionType || !questionResponse) {
      response.status(400).json({ error: 'Missing required fields: questionType and response' });
      return;
    }

    const apiKey = geminiApiKey.value();
    if (!apiKey) {
      response.status(500).json({ error: 'Gemini API key not configured' });
      return;
    }

    // Get the appropriate prompt for the question type
    const validQuestionTypes = ['entrepreneurialJourney', 'businessChallenge', 'setbacksResilience', 'finalVision'] as const;
    if (!validQuestionTypes.includes(questionType as any)) {
      response.status(400).json({ error: 'Invalid question type' });
      return;
    }
    
    const promptTemplate = SCORING_PROMPTS[questionType as keyof typeof SCORING_PROMPTS];
    if (!promptTemplate) {
      response.status(400).json({ error: 'Invalid question type' });
      return;
    }

    // Replace placeholder with actual response
    const prompt = promptTemplate.replace('{{RESPONSE}}', questionResponse);

    // Call Gemini API
    const geminiResponse = await callGemini(prompt, apiKey);
    
    // Parse the response
    const scoringResult = parseGeminiResponse(geminiResponse);

    response.json(scoringResult);

  } catch (error) {
    console.error('Error in AI scoring:', error);
    response.status(500).json({
      error: 'Failed to score response',
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
      const prompt = `You are an expert business evaluator analyzing Gutcheck.AI results. Your job is to identify a founder's top strength based on their assessment scores and provide a short, actionable insight.

Personal Foundation Score (0–20): ${scores.personalBackground}
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
      const prompt = `You are an expert business evaluator analyzing Gutcheck.AI results to identify improvement areas.

Personal Foundation Score (0–20): ${scores.personalBackground}
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

// AI Scoring Function
export const scoreResponse = onCall(async (request) => {
  try {
    const { questionType, response } = request.data;

    if (!questionType || !response) {
      throw new Error('Missing required fields: questionType and response');
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Prompts from the framework
    const SCORING_PROMPTS = {
      entrepreneurialJourney: `You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response on a scale of 1-5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      businessChallenge: `You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response on a scale of 1-5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      setbacksResilience: `You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response on a scale of 1-5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

      finalVision: `You are an expert business evaluator assessing a founder's long-term vision.
Score this response on a scale of 1-5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

Founder's Response:
{{RESPONSE}}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`
    };

    // Get the appropriate prompt for the question type
    const promptTemplate = SCORING_PROMPTS[questionType as keyof typeof SCORING_PROMPTS];
    if (!promptTemplate) {
      throw new Error('Invalid question type');
    }

    // Replace placeholder with actual response
    const prompt = promptTemplate.replace('{{RESPONSE}}', response);

    // Call Gemini API
    const geminiResponse = await callGemini(prompt, apiKey);
    
    // Parse the response
    const scoringResult = parseGeminiResponse(geminiResponse);

    return {
      success: true,
      ...scoringResult
    };

  } catch (error) {
    console.error('Error in AI scoring:', error);
    throw new Error('Failed to score response');
  }
});

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
