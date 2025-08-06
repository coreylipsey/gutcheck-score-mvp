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

// Note: CATEGORY_WEIGHTS have been moved to src/domain/entities/Assessment.ts
// Import from there instead: import { CATEGORY_WEIGHTS } from '../../domain/entities/Assessment';

// Note: ASSESSMENT_QUESTIONS have been moved to src/domain/entities/Assessment.ts
// Import from there instead: import { ASSESSMENT_QUESTIONS } from '../../domain/entities/Assessment'; 