import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const geminiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    temperature: 0.7,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
});

export const geminiProModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
});

// Helper function to generate scoring prompts
export const generateScoringPrompt = (questionType: string, response: string) => {
  const prompts = {
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

  return prompts[questionType as keyof typeof prompts] || prompts.entrepreneurialJourney;
}; 