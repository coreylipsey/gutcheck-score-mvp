import { AssessmentCategory } from '../value-objects/Category';
import { Question } from './Question';

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
  geminiFeedback?: {
    feedback: string;
    strengths: string;
    focusAreas: string;
    nextSteps: string;
  };
  outcomeTrackingReady: boolean;
  consentForML: boolean;
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
    weight: 4,
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
    validationPrompt: 'entrepreneurialJourney'
  },
  {
    id: 'q4',
    text: 'Have you started a business before?',
    category: 'personalBackground',
    type: 'multipleChoice',
    options: ['Yes, and it\'s still running', 'Yes, but it failed', 'No, this is my first time'],
    weight: 4,
    section: 'Personal and Professional Background'
  },
  {
    id: 'q5',
    text: 'What was your primary motivation for starting this business?',
    category: 'personalBackground',
    type: 'multipleChoice',
    options: ['Market opportunity I identified', 'Need for additional income', 'Desire for independence', 'Other'],
    weight: 4,
    section: 'Personal and Professional Background'
  },

  // SECTION 2: Entrepreneurial Skills
  {
    id: 'q6',
    text: 'How would you rate your problem-solving skills?',
    category: 'entrepreneurialSkills',
    type: 'multipleChoice',
    options: ['Excellent', 'Good', 'Fair', 'Poor'],
    weight: 5,
    section: 'Entrepreneurial Skills'
  },
  {
    id: 'q7',
    text: 'How often do you analyze your business performance?',
    category: 'entrepreneurialSkills',
    type: 'multipleChoice',
    options: ['Daily', 'Weekly', 'Monthly', 'Rarely'],
    weight: 5,
    section: 'Entrepreneurial Skills'
  },
  {
    id: 'q8',
    text: 'Describe a significant business challenge you\'ve faced and how you handled it.',
    subHeading: 'What was the problem, what steps did you take, and what was the outcome?',
    category: 'entrepreneurialSkills',
    type: 'openEnded',
    weight: 5,
    section: 'Entrepreneurial Skills',
    minCharacters: 150,
    validationPrompt: 'businessChallenge'
  },
  {
    id: 'q9',
    text: 'How do you typically make important business decisions?',
    category: 'entrepreneurialSkills',
    type: 'multipleChoice',
    options: ['Data-driven analysis', 'Intuition and experience', 'Consulting with mentors', 'Following industry best practices'],
    weight: 5,
    section: 'Entrepreneurial Skills'
  },
  {
    id: 'q10',
    text: 'How do you stay updated with industry trends and market changes?',
    category: 'entrepreneurialSkills',
    type: 'multiSelect',
    options: ['Industry publications and reports', 'Networking events and conferences', 'Online courses and webinars', 'Social media and blogs', 'Mentor relationships'],
    weight: 5,
    section: 'Entrepreneurial Skills'
  },

  // SECTION 3: Resources
  {
    id: 'q11',
    text: 'What is your biggest current business challenge?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Lack of funding', 'Limited access to mentorship', 'Difficulty finding customers', 'Scaling operations', 'Other'],
    weight: 4,
    section: 'Resources'
  },
  {
    id: 'q12',
    text: 'How would you describe your current financial resources?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Sufficient for current needs', 'Not enough for growth', 'Self-funded with limited budget'],
    weight: 4,
    section: 'Resources'
  },
  {
    id: 'q13',
    text: 'How strong is your professional network?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Very strong network', 'Moderate connections', 'Weak network'],
    weight: 4,
    section: 'Resources'
  },
  {
    id: 'q14',
    text: 'Do you have access to business mentors or advisors?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Yes', 'No'],
    weight: 4,
    section: 'Resources'
  },
  {
    id: 'q15',
    text: 'How often do you seek feedback from customers or stakeholders?',
    category: 'resources',
    type: 'multipleChoice',
    options: ['Weekly', 'Monthly', 'Occasionally', 'Rarely'],
    weight: 4,
    section: 'Resources'
  },

  // SECTION 4: Behavioral Metrics
  {
    id: 'q16',
    text: 'How many hours per week do you typically work on your business?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['1-10 hours', '11-20 hours', '21-40 hours', '40+ hours'],
    weight: 3,
    section: 'Behavioral Metrics'
  },
  {
    id: 'q17',
    text: 'Do you prioritize tasks and set clear goals for your business?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['Always prioritize and set goals', 'Occasionally prioritize', 'No routine prioritization'],
    weight: 3,
    section: 'Behavioral Metrics'
  },
  {
    id: 'q18',
    text: 'How do you handle setbacks and failures in your business?',
    subHeading: 'Describe a time when things didn\'t go as planned and how you responded.',
    category: 'behavioralMetrics',
    type: 'openEnded',
    weight: 3,
    section: 'Behavioral Metrics',
    minCharacters: 120,
    validationPrompt: 'setbacksResilience'
  },
  {
    id: 'q19',
    text: 'How do you measure success in your business?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['Revenue and profit', 'Customer satisfaction', 'Market share', 'Personal fulfillment', 'Social impact'],
    weight: 3,
    section: 'Behavioral Metrics'
  },
  {
    id: 'q20',
    text: 'Have you ever had to restart or pivot your business strategy?',
    category: 'behavioralMetrics',
    type: 'multipleChoice',
    options: ['Yes, and I restarted successfully', 'Yes, but I haven\'t restarted yet', 'No, never needed to'],
    weight: 3,
    section: 'Behavioral Metrics'
  },

  // SECTION 5: Growth & Vision
  {
    id: 'q21',
    text: 'What is your vision for the scale of your business?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['Small-scale local business', 'Regional expansion', 'National or global reach'],
    weight: 4,
    section: 'Growth & Vision'
  },
  {
    id: 'q22',
    text: 'How do you plan to fund your business growth?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['Bootstrapping and reinvestment', 'Loans or grants', 'External investments', 'Unsure'],
    weight: 4,
    section: 'Growth & Vision'
  },
  {
    id: 'q23',
    text: 'What is your timeline for achieving your main business goals?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['Within 1 year', '1-3 years', '3-5 years', '5+ years'],
    weight: 4,
    section: 'Growth & Vision'
  },
  {
    id: 'q24',
    text: 'How many jobs do you plan to create in the next 3 years?',
    category: 'growthVision',
    type: 'multipleChoice',
    options: ['1-5 jobs', '6+ jobs', 'No plans to hire', 'Not sure'],
    weight: 4,
    section: 'Growth & Vision'
  },
  {
    id: 'q25',
    text: 'Do you have a clear exit strategy or long-term vision for your business?',
    subHeading: 'Describe your ultimate vision for the business and how you see it evolving.',
    category: 'growthVision',
    type: 'openEnded',
    weight: 4,
    section: 'Growth & Vision',
    minCharacters: 100,
    validationPrompt: 'finalVision'
  }
]; 