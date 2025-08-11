import { NextRequest, NextResponse } from 'next/server';

interface ScoringRequest {
  questionType: 'entrepreneurialJourney' | 'businessChallenge' | 'setbacksResilience' | 'finalVision';
  response: string;
  questionText: string;
}

interface ScoringResponse {
  score: number;
  explanation: string;
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

async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

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
          temperature: 0.3, // Lower temperature for more consistent scoring
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
    throw new Error('Invalid response from Gemini API');
  }

  return responseText.trim();
}

function parseGeminiResponse(response: string): ScoringResponse {
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

export async function POST(request: NextRequest) {
  try {
    const body: ScoringRequest = await request.json();
    const { questionType, response } = body;

    if (!questionType || !response) {
      return NextResponse.json(
        { error: 'Missing required fields: questionType and response' },
        { status: 400 }
      );
    }

    // Get the appropriate prompt for the question type
    const promptTemplate = SCORING_PROMPTS[questionType];
    if (!promptTemplate) {
      return NextResponse.json(
        { error: 'Invalid question type' },
        { status: 400 }
      );
    }

    // Replace placeholder with actual response
    const prompt = promptTemplate.replace('{{RESPONSE}}', response);

    // Call Gemini API
    const geminiResponse = await callGemini(prompt);
    
    // Parse the response
    const scoringResult = parseGeminiResponse(geminiResponse);

    return NextResponse.json(scoringResult);

  } catch (error) {
    console.error('Error in AI scoring:', error);
    return NextResponse.json(
      { 
        error: 'Failed to score response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
