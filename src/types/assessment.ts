export type AssessmentCategory = 
  | 'personalBackground' 
  | 'entrepreneurialSkills' 
  | 'resources' 
  | 'behavioralMetrics' 
  | 'growthVision';

export interface AssessmentQuestion {
  id: string;
  text: string;
  subHeading?: string; // For open-ended questions
  category: AssessmentCategory;
  type: 'multipleChoice' | 'multiSelect' | 'openEnded' | 'likert';
  options?: string[];
  isOpenEnded?: boolean;
  weight: number;
  section: string;
  minCharacters?: number; // For open-ended questions
  validationPrompt?: string; // For Gemini content validation
}

export interface AssessmentResponse {
  questionId: string;
  response: string | number | string[]; // Updated to handle multi-select
  category: AssessmentCategory;
  timestamp: Date;
}

export interface AssessmentSession {
  sessionId: string;
  userId?: string;
  createdAt: Date;
  completedAt?: Date;
  responses: AssessmentResponse[];
  scores: {
    personalBackground: number;
    entrepreneurialSkills: number;
    resources: number;
    behavioralMetrics: number;
    growthVision: number;
    overallScore: number;
  };
  geminiFeedback?: {
    feedback: string;
    strengths: string;
    focusAreas: string;
    nextSteps: string;
  };
  outcomeTrackingReady: boolean;
  consentForML: boolean;
}

export interface User {
  userId: string;
  email?: string;
  createdAt: Date;
  assessments: string[]; // sessionIds
  profile?: {
    name?: string;
    industry?: string;
    location?: string;
  };
}

// Category weights as defined in your framework
export const CATEGORY_WEIGHTS = {
  personalBackground: 20,
  entrepreneurialSkills: 25,
  resources: 20,
  behavioralMetrics: 15,
  growthVision: 20,
} as const;

// All 25 questions from your framework with updates
export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
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
    isOpenEnded: true,
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
    isOpenEnded: true,
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
    isOpenEnded: true,
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
    isOpenEnded: true,
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