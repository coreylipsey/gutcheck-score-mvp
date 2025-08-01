import { AssessmentQuestion, AssessmentResponse, AssessmentCategory, CATEGORY_WEIGHTS, ASSESSMENT_QUESTIONS } from '@/types/assessment';

// Scoring logic for multiple choice questions
export const scoreMultipleChoice = (question: AssessmentQuestion, response: string): number => {
  if (!question.options) return 0;
  
  const optionIndex = question.options.indexOf(response);
  if (optionIndex === -1) return 0;
  
  // Define scoring maps for each question based on the framework
  const scoringMaps: Record<string, number[]> = {
    // SECTION 1: Personal Background
    'q1': [3, 4, 5], // Idea stage=3, Early ops=4, Established=5
    'q2': [3, 4, 5], // Solo=3, Small team=4, Large team=5
    'q4': [5, 4, 3], // Still running=5, Failed=4, First time=3
    'q5': [5, 4, 3, 2], // Market opportunity=5, Income=4, Independence=3, Other=2
    
    // SECTION 2: Entrepreneurial Skills
    'q6': [5, 4, 3, 2], // Excellent=5, Good=4, Fair=3, Poor=2
    'q7': [5, 4, 3, 2], // Daily=5, Weekly=4, Monthly=3, Rarely=2
    
    // SECTION 3: Resources
    'q11': [2, 3, 4, 5, 1], // Lack funding=2, Limited mentorship=3, Access customers=4, Scaling=5, Other=1
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
  
  const scoringMap = scoringMaps[question.id];
  if (scoringMap && scoringMap[optionIndex] !== undefined) {
    return scoringMap[optionIndex];
  }
  
  // Fallback: reverse the current logic (last option = highest score)
  const score = optionIndex + 1;
  return Math.max(1, Math.min(5, score));
};

// Scoring logic for Likert scale questions
export const scoreLikert = (response: number): number => {
  return Math.max(1, Math.min(5, response));
};

// Scoring logic for multi-select questions
export const scoreMultiSelect = (question: AssessmentQuestion, responses: string[]): number => {
  if (!question.options) return 0;

  const completedCount = responses.length;
  const totalOptions = question.options.length;

  const completionPercentage = completedCount / totalOptions;
  const normalizedScore = completionPercentage * 5;

  return Math.round(normalizedScore);
};

// Content validation for open-ended questions
export const validateOpenEndedResponse = (response: string, minCharacters: number = 100): boolean => {
  if (response.trim().length < minCharacters) {
    return false;
  }

  const trimmedResponse = response.trim();
  const nonsensePatterns = [
    /^[a-z\s]+$/i, // Only letters and spaces
    /^(.)\1+$/, // Repeated characters
    /^[0-9\s]+$/, // Only numbers and spaces
    /^[^\w\s]+$/, // Only special characters
  ];

  for (const pattern of nonsensePatterns) {
    if (pattern.test(trimmedResponse)) {
      return false;
    }
  }

  const wordCount = trimmedResponse.split(/\s+/).length;
  if (wordCount < 15) {
    return false;
  }

  return true;
};

// AI-powered scoring for open-ended questions
export const scoreOpenEndedWithAI = async (
  questionId: string, 
  response: string, 
  questionText: string
): Promise<number> => {
  try {
    // Map question IDs to question types for Gemini
    const questionTypeMap: Record<string, string> = {
      'q3': 'entrepreneurialJourney',
      'q8': 'businessChallenge', 
      'q18': 'setbacksResilience',
      'q23': 'finalVision'
    };

    const questionType = questionTypeMap[questionId] || 'general';

    const scoringResponse = await fetch('/api/gemini/score', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionType,
        response,
        questionText,
      }),
    });

    if (scoringResponse.ok) {
      const data = await scoringResponse.json();
      return data.score;
    } else {
      console.error('AI scoring failed, using fallback');
      return 3; // Fallback score
    }
  } catch (error) {
    console.error('Error in AI scoring:', error);
    return 3; // Fallback score
  }
};

// Updated normalization formula to match framework exactly
export const normalizeScore = (rawScore: number, categoryWeight: number): number => {
  // Framework formula: (Raw Score / 5) × (Category Weight / 5)
  return (rawScore / 5) * (categoryWeight / 5);
};

// Calculate category score following framework exactly
export const calculateCategoryScore = async (
  responses: AssessmentResponse[],
  category: AssessmentCategory
): Promise<number> => {
  const categoryQuestions = ASSESSMENT_QUESTIONS.filter(q => q.category === category);
  const categoryResponses = responses.filter(r => r.category === category);
  const categoryWeight = CATEGORY_WEIGHTS[category];

  let totalNormalizedScore = 0;

  for (const question of categoryQuestions) {
    const response = categoryResponses.find(r => r.questionId === question.id);
    if (!response) continue;

    let rawScore = 0;

    switch (question.type) {
      case 'multipleChoice':
        rawScore = scoreMultipleChoice(question, response.response as string);
        break;
      case 'multiSelect':
        rawScore = scoreMultiSelect(question, response.response as string[]);
        break;
      case 'likert':
        // Handle Q19 (fear of failure) with inverted scoring
        if (question.id === 'q19') {
          const likertValue = response.response as number;
          rawScore = 6 - likertValue; // Invert: 1=5, 2=4, 3=3, 4=2, 5=1
        } else {
          rawScore = scoreLikert(response.response as number);
        }
        break;
      case 'openEnded':
        // Use AI scoring for open-ended questions
        try {
          const questionTypeMap: Record<string, string> = {
            'q3': 'entrepreneurialJourney',
            'q8': 'businessChallenge', 
            'q18': 'setbacksResilience',
            'q23': 'finalVision'
          };
          
          const questionType = questionTypeMap[question.id];
          if (questionType) {
            rawScore = await scoreOpenEndedWithAI(question.id, response.response as string, question.text);
          } else {
            rawScore = 3; // Fallback for unknown open-ended questions
          }
        } catch (error) {
          console.error('AI scoring failed for question', question.id, error);
          rawScore = 3; // Fallback score
        }
        break;
    }

    // Each question contributes equally within its category
    const normalizedScore = normalizeScore(rawScore, categoryWeight);
    totalNormalizedScore += normalizedScore;
  }

  return Math.round(totalNormalizedScore);
};

// Calculate overall score by summing category scores (0-100 scale)
export const calculateOverallScore = async (responses: AssessmentResponse[]): Promise<number> => {
  const categoryScores = {
    personalBackground: await calculateCategoryScore(responses, 'personalBackground'),
    entrepreneurialSkills: await calculateCategoryScore(responses, 'entrepreneurialSkills'),
    resources: await calculateCategoryScore(responses, 'resources'),
    behavioralMetrics: await calculateCategoryScore(responses, 'behavioralMetrics'),
    growthVision: await calculateCategoryScore(responses, 'growthVision'),
  };

  // Sum all category scores to get total (0-100)
  const overallScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0);
  return Math.round(overallScore);
};

export const calculateAllScores = async (responses: AssessmentResponse[]) => {
  const categoryScores = {
    personalBackground: await calculateCategoryScore(responses, 'personalBackground'),
    entrepreneurialSkills: await calculateCategoryScore(responses, 'entrepreneurialSkills'),
    resources: await calculateCategoryScore(responses, 'resources'),
    behavioralMetrics: await calculateCategoryScore(responses, 'behavioralMetrics'),
    growthVision: await calculateCategoryScore(responses, 'growthVision'),
  };
  
  const overallScore = await calculateOverallScore(responses);
  
  return {
    ...categoryScores,
    overallScore,
  };
};

// Get star rating from overall score (matching HeroScore thresholds)
export const getStarRating = (overallScore: number): number => {
  if (overallScore >= 80) return 5; // Visionary Leader
  if (overallScore >= 60) return 4; // Strong Execution
  if (overallScore >= 40) return 3; // Emerging Traction
  if (overallScore >= 20) return 2; // Developing Potential
  return 1; // Early Spark
};

// Get category breakdown for display
export const getCategoryBreakdown = (scores: Record<string, number>) => {
  return [
    { name: 'Personal Background', score: scores.personalBackground, max: 20 },
    { name: 'Entrepreneurial Skills', score: scores.entrepreneurialSkills, max: 25 },
    { name: 'Resources', score: scores.resources, max: 20 },
    { name: 'Behavioral Metrics', score: scores.behavioralMetrics, max: 15 },
    { name: 'Growth & Vision', score: scores.growthVision, max: 20 },
  ];
};
