import {onCall} from "firebase-functions/v2/https";
import {onRequest} from "firebase-functions/v2/https";
import {setGlobalOptions} from "firebase-functions/v2";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import {defineString} from "firebase-functions/params";
import Stripe from 'stripe';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const geminiApiKey = defineString("GEMINI_API_KEY");

// Scoring prompts for open-ended questions
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

// Import AI helper functions
import { 
  generateKeyInsights,
  generateFeedbackText, 
  generateDynamicInsights,
  generateTruthfulScoreProjection, 
  generateComprehensiveAnalysis, 
  generateNextStepsText,
  callGemini,
  parseGeminiResponse 
} from './services/GeminiAIService';

// AI Feedback Generation Function - Using Gemini API
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

    // Generate enhanced feedback using the new AI functions with individual error handling
    let keyInsights, feedback, dynamicInsights, scoreProjection, comprehensiveAnalysis, nextSteps;
    
    try {
      [keyInsights, feedback, dynamicInsights, scoreProjection, comprehensiveAnalysis, nextSteps] = await Promise.all([
        generateKeyInsights(responses, scores, apiKey, industry, location),
        generateFeedbackText(responses, scores, apiKey),
        generateDynamicInsights(responses, scores, apiKey, industry, location),
        generateTruthfulScoreProjection(responses, scores, apiKey, industry, location),
        generateComprehensiveAnalysis(responses, scores, apiKey, industry, location),
        generateNextStepsText(scores, apiKey, industry, location)
      ]);
    } catch (error) {
      console.error('Error in Promise.all:', error);
      // Fallback to individual calls with error handling
             try {
         keyInsights = await generateKeyInsights(responses, scores, apiKey, industry, location);
       } catch (e) {
         console.error('Error generating key insights:', e);
         keyInsights = null;
       }
      
             try {
         feedback = await generateFeedbackText(responses, scores, apiKey);
       } catch (e) {
         console.error('Error generating feedback:', e);
         feedback = null;
       }
      
             try {
         dynamicInsights = await generateDynamicInsights(responses, scores, apiKey, industry, location);
       } catch (e) {
         console.error('Error generating dynamic insights:', e);
         dynamicInsights = null;
       }
      
             try {
         scoreProjection = await generateTruthfulScoreProjection(responses, scores, apiKey, industry, location);
       } catch (e) {
         console.error('Error generating score projection:', e);
         scoreProjection = null;
       }
      
             try {
         comprehensiveAnalysis = await generateComprehensiveAnalysis(responses, scores, apiKey, industry, location);
       } catch (e) {
         console.error('Error generating comprehensive analysis:', e);
         comprehensiveAnalysis = null;
       }
      
             try {
         nextSteps = await generateNextStepsText(scores, apiKey, industry, location);
       } catch (e) {
         console.error('Error generating next steps:', e);
         nextSteps = null;
       }
    }

    // Debug logging to see what's being returned
    console.log('Generated AI feedback:', {
      keyInsights: keyInsights ? 'present' : 'missing',
      feedback: feedback ? 'present' : 'missing',
      dynamicInsights: dynamicInsights ? 'present' : 'missing',
      scoreProjection: scoreProjection ? 'present' : 'missing',
      comprehensiveAnalysis: comprehensiveAnalysis ? 'present' : 'missing',
      nextSteps: nextSteps ? 'present' : 'missing'
    });
    
    if (comprehensiveAnalysis) {
      console.log('Comprehensive Analysis length:', comprehensiveAnalysis.length);
      console.log('Comprehensive Analysis preview:', comprehensiveAnalysis.substring(0, 100) + '...');
    }

    response.json({
      keyInsights,
      feedback,
      competitiveAdvantage: dynamicInsights?.competitiveAdvantage || {
        category: 'Unknown',
        score: '0',
        summary: 'Analysis not available',
        specificStrengths: ['Strength analysis not available']
      },
      growthOpportunity: dynamicInsights?.growthOpportunity || {
        category: 'Unknown',
        score: '0',
        summary: 'Analysis not available',
        specificWeaknesses: ['Improvement analysis not available']
      },
      scoreProjection: dynamicInsights?.projectedScore ? {
        currentScore: Object.values(scores).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number,
        projectedScore: dynamicInsights.projectedScore,
        improvementPotential: dynamicInsights.projectedScore - (Object.values(scores).reduce((a: any, b: any) => (a as number) + (b as number), 0) as number),
        analysis: {
          lowestCategory: dynamicInsights.realisticImprovements?.[0]?.questionId?.split('q')[1] ? 
            Object.keys(scores).find(cat => {
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
              return questionCategoryMap[dynamicInsights.realisticImprovements[0].questionId] === cat;
            }) : 'unknown',
          currentCategoryScore: Object.values(scores).reduce((a: any, b: any) => Math.min(a as number, b as number), Infinity) as number,
          realisticImprovements: dynamicInsights.realisticImprovements || [],
          totalPointGain: dynamicInsights.totalPointGain || 0
        }
      } : scoreProjection,
      comprehensiveAnalysis,
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

// AI Scoring Function - Using Gemini API
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
  if (!metadata) {
    console.error('No metadata found in session');
    return;
  }

  const { tokens, userId, type } = metadata;
  
  if (type !== 'token_purchase') {
    console.log('Not a token purchase, skipping');
    return;
  }

  try {
    // Create token purchase record
    const purchaseRef = db.collection('tokenPurchases').doc();
    await purchaseRef.set({
      id: purchaseRef.id,
      userId,
      amount: parseInt(tokens),
      price: session.amount_total! / 100, // Convert from cents
      currency: session.currency,
      stripePaymentIntentId: session.payment_intent as string,
      status: 'completed',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update user's token balance
    const userRef = db.collection('tokenBalances').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const currentBalance = userDoc.data()?.balance || 0;
      await userRef.update({
        balance: currentBalance + parseInt(tokens),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        lastPurchaseAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await userRef.set({
        userId,
        balance: parseInt(tokens),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        lastPurchaseAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    // Create transaction record
    const transactionRef = db.collection('tokenTransactions').doc();
    await transactionRef.set({
      id: transactionRef.id,
      userId,
      type: 'purchase',
      amount: parseInt(tokens),
      featureName: 'token_purchase',
      source: 'stripe',
      stripePaymentIntentId: session.payment_intent as string,
      description: `Purchased ${tokens} tokens`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      balanceAfter: (userDoc.exists ? (userDoc.data()?.balance || 0) : 0) + parseInt(tokens),
    });

    console.log(`Successfully processed token purchase for user ${userId}: ${tokens} tokens`);
  } catch (error) {
    console.error('Error processing checkout session:', error);
    throw error;
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent succeeded:', paymentIntent.id);
  // Additional payment success handling if needed
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  console.log('Payment intent failed:', paymentIntent.id);
  // Handle failed payment if needed
}

// Get user token information
export const getUserTokenInfo = onCall(async (request) => {
  try {
    const { userId, includeTransactionHistory = false, transactionLimit = 10 } = request.data;

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get token balance
    const balanceDoc = await db.collection('tokenBalances').doc(userId).get();
    const tokenBalance = balanceDoc.exists ? balanceDoc.data()?.balance || 0 : 0;

    // Get feature access
    const featureDoc = await db.collection('featureAccess').doc(userId).get();
    const featureAccess = featureDoc.exists ? featureDoc.data()?.features || {} : {};

    let transactionHistory = null;
    if (includeTransactionHistory) {
      const transactionsQuery = await db.collection('tokenTransactions')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(transactionLimit)
        .get();
      
      transactionHistory = transactionsQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    }

    return {
      success: true,
      tokenBalance,
      featureAccess,
      transactionHistory
    };
  } catch (error) {
    console.error('Error getting user token info:', error);
    return {
      success: false,
      tokenBalance: 0,
      featureAccess: {},
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// Spend tokens for feature access
export const spendTokensForFeature = onCall(async (request) => {
  try {
    const { userId, featureName } = request.data;

    if (!userId || !featureName) {
      throw new Error('User ID and feature name are required');
    }

    // Define feature costs
    const featureCosts: { [key: string]: { name: string; cost: number; description: string } } = {
      'ai-market-analysis': { name: 'AI Market Analysis Agent', cost: 25, description: 'Comprehensive market analysis powered by AI' },
      'investor-matching': { name: 'Investor Matching Algorithm', cost: 35, description: 'Advanced algorithm for investor matching' },
      'competitor-report': { name: 'Premium Competitor Report', cost: 15, description: 'Deep dive competitor analysis' },
      'team-analysis': { name: 'Team Dynamics Analysis', cost: 20, description: 'Comprehensive team analysis' },
      'pitch-deck-ai': { name: 'AI Pitch Deck Optimizer', cost: 30, description: 'AI-powered pitch deck optimization' },
      'growth-projections': { name: 'Advanced Growth Projections', cost: 40, description: 'Sophisticated financial modeling' }
    };

    const feature = featureCosts[featureName];
    if (!feature) {
      throw new Error('Unknown feature');
    }

    // Check if user already has access
    const featureDoc = await db.collection('featureAccess').doc(userId).get();
    const currentFeatures = featureDoc.exists ? featureDoc.data()?.features || {} : {};
    
    if (currentFeatures[featureName]) {
      return {
        success: false,
        newBalance: 0,
        featureUnlocked: false,
        error: 'Feature already unlocked'
      };
    }

    // Check token balance
    const balanceDoc = await db.collection('tokenBalances').doc(userId).get();
    const currentBalance = balanceDoc.exists ? balanceDoc.data()?.balance || 0 : 0;

    if (currentBalance < feature.cost) {
      return {
        success: false,
        newBalance: currentBalance,
        featureUnlocked: false,
        error: 'Insufficient tokens'
      };
    }

    // Spend tokens and unlock feature
    const newBalance = currentBalance - feature.cost;
    
    // Update token balance
    await db.collection('tokenBalances').doc(userId).set({
      userId,
      balance: newBalance,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Update feature access
    await db.collection('featureAccess').doc(userId).set({
      userId,
      features: { ...currentFeatures, [featureName]: true },
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    // Create transaction record
    const transactionRef = db.collection('tokenTransactions').doc();
    await transactionRef.set({
      id: transactionRef.id,
      userId,
      type: 'spend',
      amount: -feature.cost,
      featureName,
      source: 'system',
      description: `Unlocked ${feature.name}`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      balanceAfter: newBalance,
    });

    return {
      success: true,
      newBalance,
      featureUnlocked: true
    };
  } catch (error) {
    console.error('Error spending tokens for feature:', error);
    return {
      success: false,
      newBalance: 0,
      featureUnlocked: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});

// DEPRECATED: AI Scoring Function - Replaced by ADK Agent
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

// Send results email when assessment is completed
export const sendResultsEmail = onDocumentCreated(
  {
    document: 'assessmentSessions/{sessionId}',
    region: 'us-central1'
  },
  async (event) => {
    const sessionData = event.data?.data();
    if (!sessionData) {
      console.log('No session data found');
      return;
    }

    // Only send email if user is not anonymous
    if (sessionData.isAnonymous) {
      console.log('Anonymous session, skipping email');
      return;
    }

    try {
      // Get user data
      const userDoc = await db.collection('users').doc(sessionData.userId).get();
      if (!userDoc.exists) {
        console.log('User not found, skipping email');
        return;
      }

      const userData = userDoc.data();
      const email = userData?.email;
      
      if (!email) {
        console.log('No email found for user, skipping email');
        return;
      }

      // TODO: Implement actual email sending logic
      console.log(`Would send results email to ${email} for session ${event.params.sessionId}`);
      
    } catch (error) {
      console.error('Error sending results email:', error);
    }
  }
);

// DEPRECATED: Cloud Scheduler function temporarily disabled due to IAM permissions
// export const sendFollowUpSequence = onSchedule({
//   schedule: 'every 1 hours',
//   region: 'us-central1'
// }, async (event) => {
//   try {
//     // TODO: Implement follow-up email sequence logic
//     console.log('Follow-up sequence triggered');
//     
//     // Get users who completed assessment in the last 24 hours
//     const yesterday = new Date();
//     yesterday.setDate(yesterday.getDate() - 1);
//     
//     const sessionsQuery = await db.collection('assessmentSessions')
//       .where('completedAt', '>=', yesterday)
//       .where('isAnonymous', '==', false)
//       .get();
//     
//     console.log(`Found ${sessionsQuery.size} recent sessions for follow-up`);
//     
//     // TODO: Send follow-up emails
//     for (const doc of sessionsQuery.docs) {
//       const sessionData = doc.data();
//       console.log(`Would send follow-up to user ${sessionData.userId}`);
//     }
//     
//   } catch (error) {
//     console.error('Error in follow-up sequence:', error);
//   }
// });

// Mailchimp webhook for list management
export const mailchimpWebhook = onRequest(async (req, res) => {
  try {
    const { type, data } = req.body;
    
    if (type === 'subscribe') {
      // Handle new subscriber
      console.log('New Mailchimp subscriber:', data.email);
      
      // TODO: Implement subscriber processing logic
      
    } else if (type === 'unsubscribe') {
      // Handle unsubscriber
      console.log('Mailchimp unsubscribe:', data.email);
      
      // TODO: Implement unsubscriber processing logic
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing Mailchimp webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Test Mailchimp connection
export const testMailchimpConnection = onCall(async (request) => {
  try {
    // TODO: Implement Mailchimp connection test
    console.log('Testing Mailchimp connection');
    
    return {
      success: true,
      message: 'Mailchimp connection test completed'
    };
  } catch (error) {
    console.error('Error testing Mailchimp connection:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
});
