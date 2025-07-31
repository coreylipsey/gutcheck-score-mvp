import { NextRequest, NextResponse } from 'next/server';

interface ScoringRequest {
  questionType: string;
  response: string;
  questionText: string;
}

interface ScoringResponse {
  score: number;
  explanation: string;
}

export async function POST(request: NextRequest) {
  try {
    const { questionType, response, questionText }: ScoringRequest = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Generate the appropriate prompt based on question type
    const prompt = generateScoringPrompt(questionType, response, questionText);

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const data = await geminiResponse.json();
    
    // Extract the response text
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!responseText) {
      throw new Error('Invalid response from Gemini API');
    }

    // Parse the JSON response from Gemini
    let parsedResponse: ScoringResponse;
    try {
      // Extract JSON from the response (Gemini might wrap it in markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      // Fallback scoring
      parsedResponse = {
        score: 3,
        explanation: 'AI analysis temporarily unavailable. Using standard scoring.'
      };
    }

    // Validate the response
    if (typeof parsedResponse.score !== 'number' || parsedResponse.score < 1 || parsedResponse.score > 5) {
      parsedResponse.score = Math.max(1, Math.min(5, parsedResponse.score));
    }

    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Error in Gemini scoring:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process scoring request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateScoringPrompt(questionType: string, response: string, questionText: string): string {
  // Use the specific prompts from the framework document
  const prompts: Record<string, string> = {
    'entrepreneurialJourney': `You are an expert business evaluator assessing a founder's entrepreneurial journey.
Score this response on a scale of 1-5 where:
1 = Vague, lacks structure, no clear direction or milestones
3 = Decent clarity with some evidence of execution and progress
5 = Well-articulated, structured response with strong execution and clear growth path

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

    'businessChallenge': `You are an expert business evaluator assessing how a founder navigates business challenges.
Score this response on a scale of 1-5 where:
1 = Poor problem definition, reactive approach, no clear solution strategy
3 = Clear problem definition, reasonable approach, some evidence of execution
5 = Exceptional problem clarity, strategic solution, strong evidence of execution/learning

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

    'setbacksResilience': `You are an expert business evaluator assessing a founder's ability to handle setbacks.
Score this response on a scale of 1-5 where:
1 = Poor resilience, gives up easily, no clear recovery strategy
3 = Moderate resilience, recovers but slowly, some adaptation
5 = Exceptional resilience, adapts quickly, shows growth mindset and clear recovery process

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`,

    'finalVision': `You are an expert business evaluator assessing a founder's long-term vision.
Score this response on a scale of 1-5 where:
1 = Vague, unrealistic, or very limited vision, no clear roadmap
3 = Clear vision with reasonable ambition, some future goals
5 = Compelling, ambitious vision with clear roadmap and long-term impact

Founder's Response:
${response}

Return your evaluation as a JSON object with 'score' (number 1-5) and 'explanation' (string) fields.`
  };

  return prompts[questionType] || `You are an expert business evaluator assessing entrepreneurial potential. 
  
Question: ${questionText}
Response: ${response}

Score this response on a scale of 1-5 where:
1 = Poor/Inadequate response, lacks clarity, no clear direction
2 = Below average, some relevant points but poorly articulated
3 = Average/Decent response with reasonable clarity and some evidence
4 = Good response with clear structure and solid evidence
5 = Excellent response with exceptional clarity, structure, and evidence

Return your evaluation as a JSON object with exactly these fields:
{
  "score": <number between 1-5>,
  "explanation": "<brief explanation of the score in 1-2 sentences>"
}

Be consistent and fair in your evaluation. Focus on the quality of the response, clarity of thought, and evidence of entrepreneurial thinking.`;
}
