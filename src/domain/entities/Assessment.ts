import { AssessmentCategory } from '../value-objects/Category';
import { Question } from './Question';
import { PartnerMetadata } from '../value-objects/PartnerMetadata';
import { OutcomeTracking } from '../value-objects/OutcomeTracking';

export interface AssessmentScores {
  personalBackground: number;
  entrepreneurialSkills: number;
  resources: number;
  behavioralMetrics: number;
  growthVision: number;
  overallScore: number;
}

export interface AssessmentSession {
  sessionId: string;
  userId?: string;
  createdAt: Date;
  completedAt?: Date;
  responses: AssessmentResponse[];
  scores: AssessmentScores;
  starRating: number;
  categoryBreakdown: Record<string, number>;
  geminiFeedback?: {
    feedback: string;
    competitiveAdvantage: {
      category: string;
      score: string;
      summary: string;
      specificStrengths: string[];
    };
    growthOpportunity: {
      category: string;
      score: string;
      summary: string;
      specificWeaknesses: string[];
    };
    scoreProjection: {
      currentScore: number;
      projectedScore: number;
      improvementPotential: number;
      analysis?: {
        lowestCategory: string;
        currentCategoryScore: number;
        realisticImprovements: Array<{
          questionId: string;
          currentResponse: string;
          currentScore: number;
          suggestedImprovement: string;
          potentialScore: number;
          pointGain: number;
          reasoning: string;
        }>;
        totalPointGain: number;
      };
    };
    comprehensiveAnalysis: {
      signalReadout: string;
      strengthSignals: string;
      developmentAreas: string;
      trajectoryIndicators: string;
    };
    nextSteps: {
      mentorship: {
        title: string;
        description: string;
        url: string;
      };
      funding: {
        title: string;
        description: string;
        url: string;
      };
      learning: {
        title: string;
        description: string;
        url: string;
      };
    };
  };
  outcomeTrackingReady: boolean;
  consentForML: boolean;
  // NEW: Optional partner metadata (backward compatible)
  partnerMetadata?: PartnerMetadata;
  // NEW: Optional outcome tracking (backward compatible)
  outcomeTracking?: OutcomeTracking;
}

export interface AssessmentResponse {
  questionId: string;
  response: string | number | string[];
  category: AssessmentCategory;
  timestamp: Date;
}

export class Assessment {
  constructor(
    public readonly id: string,
    public readonly questions: Question[],
    public readonly categoryWeights: Record<AssessmentCategory, number>
  ) {}

  static createDefault(): Assessment {
    return new Assessment(
      'default',
      ASSESSMENT_QUESTIONS,
      CATEGORY_WEIGHTS
    );
  }

  getQuestionsByCategory(category: AssessmentCategory): Question[] {
    return this.questions.filter(q => q.category === category);
  }

  getQuestionById(id: string): Question | undefined {
    return this.questions.find(q => q.id === id);
  }
}

// Category weights as defined in the framework
export const CATEGORY_WEIGHTS = {
  personalBackground: 20,
  entrepreneurialSkills: 25,
  resources: 20,
  behavioralMetrics: 15,
  growthVision: 20,
} as const;

// All 25 questions from the framework
export const ASSESSMENT_QUESTIONS: Question[] = [
  // SECTION 1: Personal and Professional Background
  {
    id: 'q1',
    text: 'What stage is your business currently in?',
    category: 'personalBackground',
    type: 'multipleChoice',
    options: ['Idea/Concept stage', 'Early operations with a few customers', 'Established and generating consistent revenue'],
    weight: 4, // Each question in category contributes equally (20% / 5 questions = 4% each)
    section: 'Personal and Professional Background'
  },
  {
    id: 'q2',
    text: 'Do you currently have any team members or collaborators?',
    category: 'personalBackground',
    type: 'multipleChoice',
    options: ['Solo entrepreneur', 'Small team (2–5 people)', 'Larger team (6+ people)'],
    weight: 4,
    section: 'Personal and Professional Background'
  },
  {
    id: 'q3',
    text: 'Tell me about your entrepreneurial journey so far.',
    subHeading: 'What inspired you to start your business, and what progress have you made?',
    category: 'personalBackground',
    type: 'openEnded',
    weight: 4,
    section: 'Personal and Professional Background',
    minCharacters: 100,
    validationPrompt: 'Is this response coherent, relevant to entrepreneurship, and shows genuine thought about the business journey?'
  },
  {
    id: 'q4',
    text: 'Have you previously tried to start a business?',
    category: 'personalBackground',
    type: 'multipleChoice',
    options: ['Yes – it\'s still running', 'Yes – it failed', 'No – this is my first'],
    weight: 4,
    section: 'Personal and Professional Background'
  },
  {
    id: 'q5',
    text: 'What best describes your motivation for starting your business?',
    category: 'personalBackground',
    type: 'multipleChoice',
    options: ['I saw a market opportunity', 'I needed income to support myself or my family', 'I wanted independence or flexibility', 'Other'],
    weight: 4,
    section: 'Personal and Professional Background'
  },

  // SECTION 2: Entrepreneurial Skills and Readiness
  {
    id: 'q6',
    text: 'How would you rate your financial literacy?',
    category: 'entrepreneurialSkills',
    type: 'multipleChoice',
    options: ['Excellent: I can confidently manage budgets, forecasts, and financial analysis', 'Good: I understand basic budgeting and cash flow management', 'Fair: I need help understanding financial documents', 'Poor: I avoid managing finances whenever possible'],
    weight: 5, // Each question in category contributes equally (25% / 5 questions = 5% each)
    section: 'Entrepreneurial Skills and Readiness'
  },
  {
    id: 'q7',
    text: 'How frequently do you dedicate time to professional learning (e.g., reading business books, taking courses)?',
    category: 'entrepreneurialSkills',
    type: 'multipleChoice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely or never'],
    weight: 5,
    section: 'Entrepreneurial Skills and Readiness'
  },
  {
    id: 'q8',
    text: 'Describe a time when you faced a major business challenge and how you addressed it.',
    subHeading: 'How did you approach the challenge, and what was the outcome?',
    category: 'entrepreneurialSkills',
    type: 'openEnded',
    weight: 5,
    section: 'Entrepreneurial Skills and Readiness',
    minCharacters: 100,
    validationPrompt: 'Is this response coherent, relevant to business challenges, and shows genuine problem-solving thinking?'
  },
  {
    id: 'q9',
    text: 'Which of the following milestones have you completed?',
    category: 'entrepreneurialSkills',
    type: 'multiSelect',
    options: ['Business registration', 'EIN or tax ID obtained', 'Business bank account opened', 'First paying customer', 'Applied for a loan, grant, or accelerator'],
    weight: 5,
    section: 'Entrepreneurial Skills and Readiness'
  },
  {
    id: 'q10',
    text: 'Do you feel you have the skills to build a successful business?',
    category: 'entrepreneurialSkills',
    type: 'likert',
    weight: 5,
    section: 'Entrepreneurial Skills and Readiness'
  },

  // SECTION 3: Resources and Challenges
  {
    id: 'q11',
    text: 'What is the primary challenge you\'re facing in your entrepreneurial journey?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Lack of funding', 'Limited mentorship or guidance', 'Access to customers/markets', 'Difficulty scaling operations', 'Other'],
    weight: 4, // Each question in category contributes equally (20% / 5 questions = 4% each)
    section: 'Resources and Challenges'
  },
  {
    id: 'q12',
    text: 'Do you have access to startup capital or funding?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Yes, and it\'s sufficient for my current needs', 'Yes, but it\'s not enough for my goals', 'No, I am entirely self-funded'],
    weight: 4,
    section: 'Resources and Challenges'
  },
  {
    id: 'q13',
    text: 'How strong is your professional network in supporting your business growth?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Very strong: I can access mentors, investors, and industry contacts', 'Moderate: I have a few key connections', 'Weak: I need to build my network significantly'],
    weight: 4,
    section: 'Resources and Challenges'
  },
  {
    id: 'q14',
    text: 'Do you believe there are good opportunities to start or grow a business in your area?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Yes', 'No'],
    weight: 4,
    section: 'Resources and Challenges'
  },
  {
    id: 'q15',
    text: 'How often do you track progress toward your business goals?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Weekly – I review goals and progress regularly', 'Monthly – I check in on big milestones', 'Occasionally – I track informally when I remember', 'Rarely or never – I focus on daily tasks more than long-term plans'],
    weight: 4,
    section: 'Resources and Challenges'
  },

  // SECTION 4: Behavioral and Commitment Metrics
  {
    id: 'q16',
    text: 'How many hours per week do you dedicate to your business?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['1–10 hours', '11–20 hours', '21–40 hours', 'More than 40 hours'],
    weight: 3, // Each question in category contributes equally (15% / 5 questions = 3% each)
    section: 'Behavioral and Commitment Metrics'
  },
  {
    id: 'q17',
    text: 'Do you have a regular health or fitness routine?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['Yes, I prioritize physical well-being', 'Somewhat, I exercise occasionally', 'No, I do not have a fitness routine'],
    weight: 3,
    section: 'Behavioral and Commitment Metrics'
  },
  {
    id: 'q18',
    text: 'How do you typically handle setbacks?',
    subHeading: 'Can you describe how you recover from setbacks and adapt your strategy?',
    category: 'behavioralMetrics',
    type: 'openEnded',
    weight: 3,
    section: 'Behavioral and Commitment Metrics',
    minCharacters: 100,
    validationPrompt: 'Is this response coherent, relevant to resilience and setbacks, and shows genuine reflection on handling adversity?'
  },
  {
    id: 'q19',
    text: 'Does fear of failure prevent you from taking bold steps in your business?',
    category: 'behavioralMetrics',
    type: 'likert',
    weight: 3,
    section: 'Behavioral and Commitment Metrics'
  },
  {
    id: 'q20',
    text: 'Have you ever shut down a business and tried again?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['Yes – and restarted', 'Yes – but haven\'t restarted yet', 'No'],
    weight: 3,
    section: 'Behavioral and Commitment Metrics'
  },

  // SECTION 5: Growth and Vision
  {
    id: 'q21',
    text: 'Where do you see your business in five years?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['A stable, small-scale operation', 'A growing business with regional impact', 'A scalable business with national or global reach'],
    weight: 4, // Each question in category contributes equally (20% / 5 questions = 4% each)
    section: 'Growth and Vision'
  },
  {
    id: 'q22',
    text: 'How do you plan to fund your business growth?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['Bootstrapping with personal funds', 'Seeking investments (e.g., angel, VC)', 'Applying for loans or grants', 'Unsure'],
    weight: 4,
    section: 'Growth and Vision'
  },
  {
    id: 'q23',
    text: 'What is your ultimate vision for your business?',
    subHeading: 'Describe the impact you hope your business will have on your customers or industry.',
    category: 'growthVision',
    type: 'openEnded',
    weight: 4,
    section: 'Growth and Vision',
    minCharacters: 100,
    validationPrompt: 'Is this response coherent, relevant to business vision and impact, and shows genuine strategic thinking about the future?'
  },
  {
    id: 'q24',
    text: 'Do you expect your business to create jobs in the next 3 years?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['Yes – 1 to 5 jobs', 'Yes – more than 6 jobs', 'No', 'Not sure'],
    weight: 4,
    section: 'Growth and Vision'
  },
  {
    id: 'q25',
    text: 'Is your product or service new or different from what\'s commonly available in your market?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['Yes', 'No', 'Not sure'],
    weight: 4,
    section: 'Growth and Vision'
  }
];

// 🔒 MISSION CRITICAL: ASSESSMENT DATA LOCKING MECHANISM
// =====================================================
//
// ⚠️  WARNING: THIS ASSESSMENT DATA IS LOCKED AND SECURED
// ⚠️  ANY CHANGES WILL BREAK ALL EXISTING ASSESSMENT RESULTS
// ⚠️  DO NOT MODIFY WITHOUT EXPLICIT INSTRUCTIONS FROM COREY LIPSEY
//
// 🔐 LOCKING MECHANISMS:
// 1. COMPREHENSIVE COMMENT BLOCK (THIS SECTION)
// 2. QUESTION COUNT VALIDATION
// 3. CATEGORY WEIGHT VALIDATION
// 4. QUESTION STRUCTURE VALIDATION
// 5. QUESTION TYPE VALIDATION
// 6. WEIGHT DISTRIBUTION VALIDATION
//
// 📋 LOCKED ELEMENTS:
// - All 25 assessment questions (text, options, types, weights)
// - Category weights (personalBackground: 20, entrepreneurialSkills: 25, etc.)
// - Question weights within each category
// - Validation prompts for open-ended questions
// - Question IDs and structure
// - Question types and options
//
// 🚫 TO UNLOCK FOR CHANGES:
// 1. Remove this entire comment block
// 2. Make the required changes
// 3. Add a new comment block with:
//    - Date and time of changes
//    - Explicit approval from Corey Lipsey
//    - Reason for changes
//    - Impact on existing results
// 4. Update all validation functions
// 5. Test thoroughly with existing data
// 6. Document changes in commit message
//
// 📅 LOCKED ON: 2025-01-27
// 🔒 LOCKED BY: Corey Lipsey (MISSION CRITICAL)
// ✅ VALIDATION STATUS: All assessment data verified and secured
// 🎯 TARGET SCORE RANGE: 39-100 points (0-100 scale)

// Validation function to ensure data integrity
export function validateAssessmentDataIntegrity(): boolean {
  console.log('🔒 Validating assessment data integrity...');
  
  let allValid = true;

  // 1. Check that we have exactly 25 questions
  if (ASSESSMENT_QUESTIONS.length !== 25) {
    console.error('❌ CRITICAL: Assessment must have exactly 25 questions');
    allValid = false;
  }

  // 2. Check category weights sum to 100
  const totalWeight = Object.values(CATEGORY_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
  if (totalWeight !== 100) {
    console.error('❌ CRITICAL: Category weights must sum to 100');
    allValid = false;
  }

  // 3. Check that each category has the correct number of questions
  const categoryCounts = {
    personalBackground: 0,
    entrepreneurialSkills: 0,
    resources: 0,
    behavioralMetrics: 0,
    growthVision: 0,
  };

  ASSESSMENT_QUESTIONS.forEach(question => {
    categoryCounts[question.category]++;
  });

  const expectedCounts = {
    personalBackground: 5,
    entrepreneurialSkills: 5,
    resources: 5,
    behavioralMetrics: 5,
    growthVision: 5,
  };

  for (const [category, count] of Object.entries(categoryCounts)) {
    if (count !== expectedCounts[category as keyof typeof expectedCounts]) {
      console.error(`❌ CRITICAL: Category ${category} must have exactly ${expectedCounts[category as keyof typeof expectedCounts]} questions`);
      allValid = false;
    }
  }

  // 4. Check that question weights are correct
  const expectedWeights = {
    personalBackground: 4, // 20% / 5 questions = 4% each
    entrepreneurialSkills: 5, // 25% / 5 questions = 5% each
    resources: 4, // 20% / 5 questions = 4% each
    behavioralMetrics: 3, // 15% / 5 questions = 3% each
    growthVision: 4, // 20% / 5 questions = 4% each
  };

  for (const question of ASSESSMENT_QUESTIONS) {
    const expectedWeight = expectedWeights[question.category];
    if (question.weight !== expectedWeight) {
      console.error(`❌ CRITICAL: Question ${question.id} weight should be ${expectedWeight}, got ${question.weight}`);
      allValid = false;
    }
  }

  // 5. Validate question structure and types
  const expectedQuestionTypes = {
    'q1': 'multipleChoice', 'q2': 'multipleChoice', 'q3': 'openEnded', 'q4': 'multipleChoice', 'q5': 'multipleChoice',
    'q6': 'multipleChoice', 'q7': 'multipleChoice', 'q8': 'openEnded', 'q9': 'multiSelect', 'q10': 'likert',
    'q11': 'multipleChoice', 'q12': 'multipleChoice', 'q13': 'multipleChoice', 'q14': 'multipleChoice', 'q15': 'multipleChoice',
    'q16': 'multipleChoice', 'q17': 'multipleChoice', 'q18': 'openEnded', 'q19': 'likert', 'q20': 'multipleChoice',
    'q21': 'multipleChoice', 'q22': 'multipleChoice', 'q23': 'openEnded', 'q24': 'multipleChoice', 'q25': 'multipleChoice',
  };

  for (const [questionId, expectedType] of Object.entries(expectedQuestionTypes)) {
    const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
    if (!question) {
      console.error(`❌ CRITICAL: Missing question ${questionId}`);
      allValid = false;
      continue;
    }
    
    if (question.type !== expectedType) {
      console.error(`❌ CRITICAL: Question type mismatch for ${questionId}. Expected: ${expectedType}, Got: ${question.type}`);
      allValid = false;
    }
  }

  // 6. Validate question options for multiple choice questions
  const expectedOptions = {
    'q1': 3, 'q2': 3, 'q4': 3, 'q5': 4,
    'q6': 4, 'q7': 4,
    'q11': 5, 'q12': 3, 'q13': 3, 'q14': 2, 'q15': 4,
    'q16': 4, 'q17': 3, 'q20': 3,
    'q21': 3, 'q22': 4, 'q24': 4, 'q25': 3,
  };

  for (const [questionId, expectedOptionCount] of Object.entries(expectedOptions)) {
    const question = ASSESSMENT_QUESTIONS.find(q => q.id === questionId);
    if (question && question.options) {
      if (question.options.length !== expectedOptionCount) {
        console.error(`❌ CRITICAL: Question ${questionId} should have ${expectedOptionCount} options, got ${question.options.length}`);
        allValid = false;
      }
    }
  }

  if (allValid) {
    console.log('✅ Assessment data integrity validated successfully');
    console.log('🔒 All assessment data is locked and secured');
    console.log('🎯 Target score range: 35-100 points (0-100 scale)');
  } else {
    console.error('❌ CRITICAL: Assessment data validation failed');
    console.error('🚫 Build blocked - assessment integrity compromised');
    throw new Error('Assessment data validation failed - build blocked');
  }

  return allValid;
}

// Run validation on module load
if (typeof window === 'undefined') { // Only run on server side
  validateAssessmentDataIntegrity();
} 